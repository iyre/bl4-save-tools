#!/usr/bin/env python3
# Extract missionsets and/or collectibles from a Borderlands 4 YAML save file
# Produce compressed, base64-encoded strings for usage in JavaScript

import yaml
import argparse
import zlib
import base64
import sys

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

def write_yaml_and_compressed(obj, output_yaml, compressed_txt):
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
    parser.add_argument('--inputyaml', required=True, help='Input YAML file')
    parser.add_argument('--missions-outputyaml', help='Output YAML file for missionsets')
    parser.add_argument('--missions-compressed', help='Output compressed base64 file for missionsets')
    parser.add_argument('--collectibles-outputyaml', help='Output YAML file for collectibles')
    parser.add_argument('--collectibles-compressed', help='Output compressed base64 file for collectibles')
    parser.add_argument('--extract', choices=['missions', 'collectibles', 'both'], default='both',
                        help='What to extract: missions, collectibles, or both (default: both)')
    args = parser.parse_args()

    with open(args.inputyaml, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    if args.extract in ('missions', 'both'):
        if not args.missions_outputyaml:
            print("Error: --missions-outputyaml is required for missions extraction.", file=sys.stderr)
            sys.exit(1)
        missionsets = extract_missionsets(data)
        write_yaml_and_compressed(missionsets, args.missions_outputyaml, args.missions_compressed)
        print(f"Extracted {len(missionsets)} missionsets.")

    if args.extract in ('collectibles', 'both'):
        if not args.collectibles_outputyaml:
            print("Error: --collectibles-outputyaml is required for collectibles extraction.", file=sys.stderr)
            sys.exit(1)
        collectibles = extract_collectibles(data)
        write_yaml_and_compressed(collectibles, args.collectibles_outputyaml, args.collectibles_compressed)
        print(f"Extracted {len(collectibles)} collectibles.")
