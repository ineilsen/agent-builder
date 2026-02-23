import sys
import json
import os
from pyhocon import ConfigFactory, HOCONConverter

if len(sys.argv) < 3:
    print("Usage: python pyhocon_parser_service.py <file_path> <registry_root>", file=sys.stderr)
    sys.exit(1)

file_path = sys.argv[1]
registry_root = sys.argv[2]

try:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix includes: 'include "registries/' -> 'include "'
    fixed_content = content.replace('include "registries/', 'include "')
    
    conf = ConfigFactory.parse_string(fixed_content, basedir=registry_root)
    print(HOCONConverter.to_json(conf))
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
