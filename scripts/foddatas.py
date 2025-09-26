#!/usr/bin/env python3
# extract/inject fog of war data from/to a Borderlands 4 YAML save file

import yaml
import base64
import zlib
from pathlib import Path

def unknown_tag(loader, tag_suffix, node):
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    elif isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    else:
        return loader.construct_scalar(node)

yaml.SafeLoader.add_multi_constructor('!', unknown_tag)

def extract_foddatas(yaml_path, output_dir):
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    foddatas = data['gbx_discovery_pc']['foddatas']
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    for entry in foddatas:
        levelname = entry['levelname']
        foddata_b64 = entry['foddata']
        compressed = base64.b64decode(foddata_b64)
        decompressed = zlib.decompress(compressed)
        out_file = output_dir / f"{levelname}.bin"
        with open(out_file, 'wb') as out:
            out.write(decompressed)
        print(f"Extracted {levelname} to {out_file}")

def inject_foddata(yaml_path, input_dir, output_yaml, fill_ff=False):
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    foddatas = data['gbx_discovery_pc']['foddatas']
    input_dir = Path(input_dir) if input_dir else None

    for entry in foddatas:
        levelname = entry['levelname']
        if fill_ff:
            raw = bytes([0xFF] * 16384)
            print(f"Injecting all-FF data into {levelname}")
        else:
            in_file = input_dir / f"{levelname}.bin"
            if in_file.exists():
                with open(in_file, 'rb') as inp:
                    raw = inp.read()
                print(f"Injected {in_file} into {levelname}")
            else:
                print(f"Warning: {in_file} not found, skipping.")
                continue
        compressed = zlib.compress(raw)
        foddata_b64 = base64.b64encode(compressed).decode('ascii')
        entry['foddata'] = foddata_b64

    # Write back to YAML (overwrite or to new file)
    out_path = output_yaml or yaml_path
    with open(out_path, 'w', encoding='utf-8') as f:
        yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)
    print(f"Updated YAML written to {out_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Extract/inject fog of war data from/to a YAML save file")

    sub = parser.add_subparsers(dest="cmd", required=True)

    p_extract = sub.add_parser(
        "extract",
        help="Extract fog of war data from a YAML save file to per-level binary files for easier manipulation",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    p_extract.add_argument('--inputyaml', help='Input YAML file', required=True)
    p_extract.add_argument('--outputdir', help='Directory for output foddata files', required=True)

    p_inject = sub.add_parser(
        "inject",
        help="Inject fog of war data from per-level binary files to a YAML save file",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    p_inject.add_argument('--inputdir', help='Directory for input foddata files')
    p_inject.add_argument('--outputyaml', help='Output YAML file', required=True)
    p_inject.add_argument('--fill', action='store_true', help='Inject 16KB of all-0xFF data for every level (overrides inputdir)')

    args = parser.parse_args()

    if args.cmd == "extract":
        extract_foddatas(args.inputyaml, args.outputdir)
    elif args.cmd == "inject":
        inject_foddata(
            yaml_path=args.outputyaml,
            input_dir=args.inputdir,
            output_yaml=args.outputyaml,
            fill_ff=args.fill
        )
    else:
        print("Please specify either extract or inject")
