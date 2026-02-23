import os
import sys
from pyhocon import ConfigFactory

# Setup paths
ROOT_DIR = "/Users/neil/Documents/NHS/neuro-san-studio"
MANIFEST_PATH = os.path.join(ROOT_DIR, "registries", "manifest.hocon")

print(f"Parsing {MANIFEST_PATH}")

try:
    with open(MANIFEST_PATH, 'r') as f:
        content = f.read()
    
    # Fix includes in-memory: 'include "registries/' -> 'include "'
    # This allows resolving relative to the registries directory
    fixed_content = content.replace('include "registries/', 'include "')
    
    # Parse string with base directory set to registries/
    registry_dir = os.path.dirname(MANIFEST_PATH)
    config = ConfigFactory.parse_string(fixed_content, basedir=registry_dir)
    
    print("\n--- Keys Found (In-Memory Fix) ---")
    for key, value in config.items():
        if isinstance(value, bool) and value is True:
             print(f"Key: {key}")
        elif isinstance(value, dict) and value.get("serve", False) is True:
             print(f"Key: {key} (Served)")
             
except Exception as e:
    print(f"Error: {e}")
