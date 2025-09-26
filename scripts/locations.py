#!/usr/bin/env python3
# extract discovered locations from a Borderlands 4 YAML save file

import yaml
import argparse
import re

def unknown_tag(loader, tag_suffix, node):
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    elif isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    else:
        return loader.construct_scalar(node)

yaml.SafeLoader.add_multi_constructor('!', unknown_tag)

def extract_locations(yaml_path, output_js):
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # Extract the long string from the YAML key and split on ':<digit>:'
    dlblob = data['gbx_discovery_pg']['dlblob']
    locations = re.split(r':\d:', dlblob)
    locations = [loc for loc in locations if loc] # Remove empty strings
    locations.sort()

    # Write to JS file
    with open(output_js, 'w', encoding='utf-8') as out:
        out.write("const DISCOVERED_LOCATIONS = [\n")
        out.write(',\n'.join(f"'{loc}'" for loc in locations))
        out.write(",\n]")

    print(f"Extracted {len(locations)} locations to {output_js}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract discovered locations from a YAML save file and export as a JS array")
    parser.add_argument('--inputyaml', help='Input YAML file', required=True)
    parser.add_argument('--outputjs', help='Output JS file', required=True)
    args = parser.parse_args()

    extract_locations(args.inputyaml, args.outputjs)
