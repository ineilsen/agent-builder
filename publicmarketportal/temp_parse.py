import sys
import json
import os
from pyhocon import ConfigFactory, HOCONConverter

file_path = 'registries/basic/coffee_finder.hocon'
registry_root = os.path.abspath('registries')

try:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix includes: 'include "registries/' -> 'include "'
    fixed_content = content.replace('include "registries/', 'include "')
    
    conf = ConfigFactory.parse_string(fixed_content, basedir=registry_root)
    print(HOCONConverter.to_json(conf))
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
