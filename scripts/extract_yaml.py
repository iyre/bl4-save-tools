#!/usr/bin/env python3
"""
Extract game data from Borderlands 4 YAML save files.

Extracts missionsets, collectibles, and unlockables from save files and outputs
them as YAML files with optional compression for use in JavaScript.

Supports merging with existing data files and can automatically update blobs.js.

Examples:
    Extract collectibles with compression:
        python extract_yaml.py -i ../../1.yaml -c ../data/collectibles.yaml -cc
    
    Extract and update blobs.js automatically:
        python extract_yaml.py -i ../../1.yaml -c ../data/collectibles.yaml -cc -b ../assets/blobs.js
    
    Extract multiple types:
        python extract_yaml.py -i ../../1.yaml \
            -m ../data/missions.yaml -mc \
            -c ../data/collectibles.yaml -cc \
            -b ../assets/blobs.js
    
    Extract unlockables from profile:
        python extract_yaml.py -i ../../profile.yaml -u ../data/unlockables.yaml -uc
"""

import yaml
import argparse
import zlib
import base64
import sys
import os
from pathlib import Path

try:
    from update_blobs import update_blob_constant
    HAS_UPDATE_BLOBS = True
except ImportError:
    HAS_UPDATE_BLOBS = False


def unknown_tag(loader, tag_suffix, node):
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    elif isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    else:
        return loader.construct_scalar(node)


yaml.SafeLoader.add_multi_constructor('!', unknown_tag)


def extract_missionsets(data, no_sort=False):
    local_sets = data.get('missions', {}).get('local_sets', {})
    sorted_sets = {}
    missionset_keys = local_sets.keys() if no_sort else sorted(local_sets.keys())
    for missionset_key in missionset_keys:
        missionset = local_sets[missionset_key]
        missionset_copy = dict(missionset)
        if 'missions' in missionset and isinstance(missionset['missions'], dict):
            mission_keys = missionset['missions'].keys() if no_sort else sorted(missionset['missions'].keys())
            sorted_missions = {k: missionset['missions'][k] for k in mission_keys}
            missionset_copy['missions'] = sorted_missions
        sorted_sets[missionset_key] = missionset_copy
    return sorted_sets


def extract_collectibles(data):
    return data.get('stats', {}).get('openworld', {}).get('collectibles', {})


def extract_global_unlockables(data):
    return data.get('domains', {}).get('local', {}).get('unlockables', {})


def sort_dict(obj, no_sort=False):
    if no_sort:
        return obj
    if isinstance(obj, dict):
        # Sort keys case-insensitively
        return {k: sort_dict(obj[k]) for k in sorted(obj, key=lambda x: x.lower())}
    elif isinstance(obj, list):
        try:
            return sorted((sort_dict(x) for x in obj), key=lambda x: str(x).lower())
        except TypeError:
            return [sort_dict(x) for x in obj]
    else:
        return obj


# Rough ordering of mission status values from least to most "complete", used to decide
# which of two mission entries to keep when merging with --no-sort. Unrecognized statuses
# fall back to a neutral score of 0.
MISSION_STATUS_PRIORITY = {
    'notstarted': 0,
    'inactive': 0,
    'available': 1,
    'active': 2,
    'deactivated': 2,
    'readytoturnin': 3,
    'ready_to_turn_in': 3,
    'completed_finishing': 4,
    'completed_postfinished': 5,
    'completed': 6,
}


def mission_completeness(mission):
    """
    Score a mission entry's progress so merging can keep whichever version (existing or
    new) is further along, e.g. when the same mission is extracted from saves for
    different characters or at different points in time.
    """
    if not isinstance(mission, dict):
        return (0, 0)
    status = str(mission.get('status', '')).strip().lower()
    status_score = MISSION_STATUS_PRIORITY.get(status, 0)
    final = mission.get('final', {})
    completed_count = 0
    if isinstance(final, dict):
        completed_count = sum(1 for v in final.values() if v is True or str(v).lower() == 'completed')
    return (status_score, completed_count)


def merge_missions(existing_missions, new_missions):
    """
    Merge a missionset's `missions` dict in place, preserving the existing key order.
    Unlike merge_yaml's generic field-by-field merge, a mission present in both is not
    merged - whichever of the two versions is more complete replaces the other wholesale,
    at its existing position (line), avoiding a hybrid of state from different playthroughs.
    New missions are appended at the end.
    """
    for mission_id, new_mission in new_missions.items():
        if mission_id in existing_missions:
            old_mission = existing_missions[mission_id]
            if mission_completeness(new_mission) > mission_completeness(old_mission):
                existing_missions[mission_id] = new_mission
            # else: keep the existing (more or equally complete) entry as-is
        else:
            existing_missions[mission_id] = new_mission
    return existing_missions


def merge_lists(old_list, new_list, no_sort=False):
    if all(isinstance(x, str) for x in old_list + new_list):
        mapping = {}
        # keep old entry if theres a casing difference.
        # the game doesnt actually care, so it's probably best to reduce unnecessary updates.
        for x in old_list:
            mapping[x.lower()] = x
        for x in new_list:
            lk = x.lower()
            if lk not in mapping:
                mapping[lk] = x
        merged = list(mapping.values())
        if not no_sort:
            merged.sort(key=lambda x: x.lower())
        return merged
    else:
        # Fallback: keep unique items (preserve order from existing then new)
        merged = list(old_list)
        for item in new_list:
            if not any(item == existing_item for existing_item in merged):
                merged.append(item)
        if not no_sort:
            try:
                merged = sorted(merged, key=lambda x: str(x).lower())
            except Exception:
                pass
        return merged


def merge_yaml(existing, new, no_sort=False):
    """
    Recursively merge new into existing:
    - Add new keys/values.
    - If value is a dict, recurse (unless it's a missionset's `missions` dict under
      --no-sort, which uses merge_missions instead - see its docstring).
    - If value is a list, add new items (no duplicates, ignoring capitalization).
    - If value is a scalar, update only if not a dict/list.
    With --no-sort, existing key order is preserved and new keys are appended at the end
    instead of the whole level being re-sorted alphabetically.
    """
    for key, new_val in new.items():
        if key in existing:
            old_val = existing[key]
            if no_sort and key == 'missions' and isinstance(old_val, dict) and isinstance(new_val, dict):
                merge_missions(old_val, new_val)
            elif isinstance(old_val, dict) and isinstance(new_val, dict):
                merge_yaml(old_val, new_val, no_sort)
            elif isinstance(old_val, list) and isinstance(new_val, list):
                existing[key] = merge_lists(old_val, new_val, no_sort)
            elif not isinstance(old_val, (dict, list)):
                # Only update if not an object/array
                existing[key] = new_val
            # else: do not update if types are incompatible
        else:
            # Add new key (already lands at the end - dicts preserve insertion order)
            existing[key] = new_val
    # Sort keys at this level, unless order should be preserved
    if isinstance(existing, dict) and not no_sort:
        sorted_items = sorted(existing.items(), key=lambda x: x[0].lower())
        existing.clear()
        existing.update(sorted_items)
    return existing


def write_yaml_and_compressed(obj, output_yaml, compressed, blob_constant=None, blobs_js_path=None, no_sort=False):
    # If existing_yaml is provided, load and merge
    if output_yaml and os.path.exists(output_yaml):
        with open(output_yaml, 'r', encoding='utf-8') as f:
            existing = yaml.safe_load(f) or {}
        obj = merge_yaml(existing, obj, no_sort)
    with open(output_yaml, 'w', encoding='utf-8') as f:
        yaml.safe_dump(obj, f, allow_unicode=True, sort_keys=False)
    if compressed:
        compressed_txt = str(Path(output_yaml).with_suffix('')) + '_compressed.txt'
        yaml_str = yaml.safe_dump(obj, allow_unicode=True, sort_keys=False)
        compressed_data = zlib.compress(yaml_str.encode('utf-8'))
        b64 = base64.b64encode(compressed_data).decode('ascii')
        with open(compressed_txt, 'w', encoding='utf-8') as f:
            f.write(b64)
        # Optionally update blobs.js
        if blob_constant and blobs_js_path and HAS_UPDATE_BLOBS:
            update_blob_constant(blobs_js_path, blob_constant, b64)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract missionsets, collectibles, and/or unlockables from a YAML save file.",
        epilog="""
Examples:
  # Extract collectibles with compression
  %(prog)s -i ../../1.yaml -c ../data/collectibles.yaml -cc
  
  # Extract and auto-update blobs.js
  %(prog)s -i ../../1.yaml -c ../data/collectibles.yaml -cc -b ../assets/blobs.js
  
  # Extract missions and collectibles
  %(prog)s -i ../../1.yaml -m ../data/missions.yaml -mc -c ../data/collectibles.yaml -cc
  
  # Extract unlockables from profile.yaml
  %(prog)s -i ../../profile.yaml -u ../data/unlockables.yaml -uc -b ../assets/blobs.js
        """,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('-i', '--input', required=True, help='Input YAML file')
    parser.add_argument('-m', '--missions-out', help='Output YAML file for missionsets')
    parser.add_argument('-mc', '--missions-comp', action='store_true', help='Output compressed base64 file for missionsets')
    parser.add_argument('-c', '--collectibles-out', help='Output YAML file for collectibles')
    parser.add_argument('-cc', '--collectibles-comp', action='store_true', help='Output compressed base64 file for collectibles')
    parser.add_argument('-u', '--unlockables-out', help='Output YAML file for unlockables. (profile.sav)')
    parser.add_argument('-uc', '--unlockables-comp', action='store_true', help='Output compressed base64 file for unlockables')
    parser.add_argument('-b', '--blobs-js', help='Path to blobs.js file to update')
    parser.add_argument('-ns', '--no-sort', action='store_true',
                         help='Preserve source/insertion order instead of sorting keys and lists. '
                              'New entries are appended at the end of their containing object instead of '
                              'being interleaved alphabetically. Mission entries that already exist are '
                              'replaced in place (same position) by whichever version - existing or new - '
                              'is more "complete", rather than being merged field-by-field.')
    args = parser.parse_args()

    if not args.missions_out and not args.collectibles_out and not args.unlockables_out:
        print("Error: At least one of --missions-out or --collectibles-out or --unlockables-out must be specified.", file=sys.stderr)
        sys.exit(1)

    with open(args.input, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    if args.missions_out:
        missionsets = extract_missionsets(data, args.no_sort)
        write_yaml_and_compressed(
            missionsets,
            args.missions_out,
            args.missions_comp,
            blob_constant='MISSIONSETS_COMPRESSED' if args.blobs_js else None,
            blobs_js_path=args.blobs_js,
            no_sort=args.no_sort
        )
        print(f"Extracted {len(missionsets)} missionsets.")

    if args.collectibles_out:
        collectibles = sort_dict(extract_collectibles(data), args.no_sort)
        write_yaml_and_compressed(
            collectibles,
            args.collectibles_out,
            args.collectibles_comp,
            blob_constant='COLLECTIBLES_COMPRESSED' if args.blobs_js else None,
            blobs_js_path=args.blobs_js,
            no_sort=args.no_sort
        )
        print(f"Extracted {len(collectibles)} collectible categories.")

    if args.unlockables_out:
        unlockables = sort_dict(extract_global_unlockables(data), args.no_sort)
        write_yaml_and_compressed(
            unlockables,
            args.unlockables_out,
            args.unlockables_comp,
            blob_constant='UNLOCKABLES_COMPRESSED' if args.blobs_js else None,
            blobs_js_path=args.blobs_js,
            no_sort=args.no_sort
        )
        print(f"Extracted {len(unlockables)} unlockables categories.")
