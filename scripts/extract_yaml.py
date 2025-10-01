#!/usr/bin/env python3
# Extract missionsets and/or collectibles from a Borderlands 4 YAML save file
# Produce compressed, base64-encoded strings for usage in JavaScript

import yaml
import argparse
import zlib
import base64
import sys
import os

def unknown_tag(loader, tag_suffix, node):
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    elif isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    else:
        return loader.construct_scalar(node)

yaml.SafeLoader.add_multi_constructor('!', unknown_tag)

def extract_missionsets(data):
    local_sets = data.get('missions', {}).get('local_sets', {})
    sorted_sets = {}
    for missionset_key in sorted(local_sets.keys()):
        missionset = local_sets[missionset_key]
        missionset_copy = dict(missionset)
        if 'missions' in missionset and isinstance(missionset['missions'], dict):
            sorted_missions = {k: missionset['missions'][k] for k in sorted(missionset['missions'].keys())}
            missionset_copy['missions'] = sorted_missions
        sorted_sets[missionset_key] = missionset_copy
    return sorted_sets

def extract_collectibles(data):
    return data.get('stats', {}).get('openworld', {}).get('collectibles', {})

def extract_global_unlockables(data):
    return data.get('domains', {}).get('local', {}).get('unlockables', {})

def sort_dict(obj):
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

def merge_yaml(existing, new):
    """
    Recursively merge new into existing:
    - Add new keys/values.
    - If value is a dict, recurse.
    - If value is a list, add new items (no duplicates) and sort.
    - If value is a scalar, update only if not a dict/list.
    """
    for key, new_val in new.items():
        if key in existing:
            old_val = existing[key]
            if isinstance(old_val, dict) and isinstance(new_val, dict):
                merge_yaml(old_val, new_val)
            elif isinstance(old_val, list) and isinstance(new_val, list):
                # Merge, deduplicate, and sort
                merged = list(set(old_val) | set(new_val))
                # If all elements are strings, sort as strings
                if all(isinstance(x, str) for x in merged):
                    merged.sort(key=lambda x: x.lower())
                else:
                    merged.sort()
                existing[key] = merged
            elif not isinstance(old_val, (dict, list)):
                # Only update if not an object/array
                existing[key] = new_val
            # else: do not update if types are incompatible
        else:
            # Add new key
            existing[key] = new_val
    # Sort keys at this level
    if isinstance(existing, dict):
        sorted_items = sorted(existing.items(), key=lambda x: x[0].lower())
        existing.clear()
        existing.update(sorted_items)
    return existing

def write_yaml_and_compressed(obj, output_yaml, compressed_txt):
    # If existing_yaml is provided, load and merge
    if output_yaml and os.path.exists(output_yaml):
        with open(output_yaml, 'r', encoding='utf-8') as f:
            existing = yaml.safe_load(f) or {}
        obj = merge_yaml(existing, obj)
    with open(output_yaml, 'w', encoding='utf-8') as f:
        yaml.safe_dump(obj, f, allow_unicode=True, sort_keys=False)
    if compressed_txt:
        yaml_str = yaml.safe_dump(obj, allow_unicode=True, sort_keys=False)
        compressed = zlib.compress(yaml_str.encode('utf-8'))
        b64 = base64.b64encode(compressed).decode('ascii')
        with open(compressed_txt, 'w', encoding='utf-8') as f:
            f.write(b64)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract missionsets and/or collectibles from a YAML save file.")
    parser.add_argument('-i', '--input', required=True, help='Input YAML file')
    parser.add_argument('-m', '--missions-out', help='Output YAML file for missionsets')
    parser.add_argument('-mc', '--missions-comp', help='Output compressed base64 file for missionsets')
    parser.add_argument('-c', '--collectibles-out', help='Output YAML file for collectibles')
    parser.add_argument('-cc', '--collectibles-comp', help='Output compressed base64 file for collectibles')
    parser.add_argument('-u', '--unlockables-out', help='Output YAML file for unlockables. (profile.sav)')
    parser.add_argument('-uc', '--unlockables-comp', help='Output compressed base64 file for unlockables')
    args = parser.parse_args()

    if not args.missions_out and not args.collectibles_out and not args.unlockables_out:
        print("Error: At least one of --missions-out or --collectibles-out or --unlockables-out must be specified.", file=sys.stderr)
        sys.exit(1)

    with open(args.input, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    if args.missions_out:
        missionsets = extract_missionsets(data)
        write_yaml_and_compressed(missionsets, args.missions_out, args.missions_comp)
        print(f"Extracted {len(missionsets)} missionsets.")

    if args.collectibles_out:
        collectibles = sort_dict(extract_collectibles(data))
        write_yaml_and_compressed(collectibles, args.collectibles_out, args.collectibles_comp)
        print(f"Extracted {len(collectibles)} collectible categories.")

    if args.unlockables_out:
        unlockables = sort_dict(extract_global_unlockables(data))
        write_yaml_and_compressed(unlockables, args.unlockables_out, args.unlockables_comp)
        print(f"Extracted {len(unlockables)} unlockables categories.")
