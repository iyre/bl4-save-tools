#!/usr/bin/env python3
# Extract discovered locations from a Borderlands 4 YAML save file
# Produce compressed, base64-encoded strings for usage in JavaScript

import yaml
import argparse
import re
import zlib
import base64

def unknown_tag(loader, tag_suffix, node):
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    elif isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    else:
        return loader.construct_scalar(node)

yaml.SafeLoader.add_multi_constructor('!', unknown_tag)

def extract_locations(yaml_path, raw_txt, compressed_txt):
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # Extract the long string from the YAML key and split on ':<digit>:'
    dlblob = data['gbx_discovery_pg']['dlblob']
    locations = re.split(r':\d:', dlblob)
    locations = [loc for loc in locations if loc]  # Remove empty strings
    locations = sorted(set(locations))

    # Write raw locations to txt file (one per line)
    with open(raw_txt, 'w', encoding='utf-8') as out:
        for loc in locations:
            out.write(loc + '\n')

    # Join, compress, and encode for JS
    joined = ','.join(locations)
    compressed = zlib.compress(joined.encode('utf-8'))
    b64 = base64.b64encode(compressed).decode('ascii')

    with open(compressed_txt, 'w', encoding='utf-8') as out:
        out.write(b64)

    print(f"Extracted {len(locations)} locations.")
    print(f"Raw locations written to {raw_txt}")
    print(f"Compressed, base64 string written to {compressed_txt}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract discovered locations from a YAML save file and export as raw and compressed files")
    parser.add_argument('--inputyaml', help='Input YAML file', required=True)
    parser.add_argument('--outputtext', help='Output raw .txt file (one location per line)', required=True)
    parser.add_argument('--compressed', help='Output compressed base64 .txt file', required=True)
    args = parser.parse_args()

    extract_locations(args.inputyaml, args.outputtext, args.compressed)
