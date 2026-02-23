#!/usr/bin/env python3
"""
Parse manifest files and return list of served agent networks.
Usage: python pyhocon_manifest_parser.py <registries_root>
"""
import sys
import json
import os
import re

def parse_manifest_entries(content: str) -> dict:
    """
    Parse HOCON manifest entries from file content.
    Returns dict of {filename: value} where value is True, False, or dict.
    """
    entries = {}
    
    # Remove comments
    lines = []
    for line in content.split('\n'):
        # Remove line comments
        comment_pos = line.find('#')
        if comment_pos >= 0:
            line = line[:comment_pos]
        lines.append(line)
    content = '\n'.join(lines)
    
    # Pattern for simple entries like "file.hocon": true or "file.hocon": false
    simple_pattern = r'"([^"]+\.hocon)"\s*:\s*(true|false)'
    for match in re.finditer(simple_pattern, content):
        filename = match.group(1)
        value = match.group(2) == 'true'
        entries[filename] = value
    
    # Pattern for object entries like "file.hocon": { "serve": true, "public": false }
    # This is a simplified parser that handles the common case
    object_pattern = r'"([^"]+\.hocon)"\s*:\s*\{([^}]+)\}'
    for match in re.finditer(object_pattern, content):
        filename = match.group(1)
        obj_content = match.group(2)
        
        obj = {}
        # Look for "serve": true/false
        serve_match = re.search(r'"serve"\s*:\s*(true|false)', obj_content)
        if serve_match:
            obj['serve'] = serve_match.group(1) == 'true'
        
        # Look for "public": true/false  
        public_match = re.search(r'"public"\s*:\s*(true|false)', obj_content)
        if public_match:
            obj['public'] = public_match.group(1) == 'true'
        
        entries[filename] = obj
    
    return entries

def get_served_networks(registries_root: str) -> list[str]:
    """
    Parse all manifest files in registries and return served+public agent networks.
    """
    served_networks = []
    
    # List of manifest files to parse
    manifest_files = [
        os.path.join(registries_root, 'manifest.hocon'),
        os.path.join(registries_root, 'basic', 'manifest.hocon'),
        os.path.join(registries_root, 'tools', 'manifest.hocon'),
        os.path.join(registries_root, 'industry', 'manifest.hocon'),
        os.path.join(registries_root, 'experimental', 'manifest.hocon'),
    ]
    
    for manifest_path in manifest_files:
        if not os.path.exists(manifest_path):
            continue
        
        try:
            with open(manifest_path, 'r') as f:
                content = f.read()
            
            entries = parse_manifest_entries(content)
            
            for filename, value in entries.items():
                # Determine if served
                is_served = False
                is_public = True  # Default to public
                
                if isinstance(value, bool):
                    is_served = value
                elif isinstance(value, dict):
                    is_served = value.get('serve', False)
                    is_public = value.get('public', True)
                
                # Only include if served and public
                if is_served and is_public:
                    # Remove .hocon extension for display
                    network_name = filename.replace('.hocon', '')
                    served_networks.append(network_name)
                    
        except Exception as e:
            print(f"Warning: Could not parse {manifest_path}: {e}", file=sys.stderr)
    
    return sorted(list(set(served_networks)))  # Remove duplicates

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python pyhocon_manifest_parser.py <registries_root>", file=sys.stderr)
        sys.exit(1)
    
    registries_root = sys.argv[1]
    
    if not os.path.isdir(registries_root):
        print(f"Registries directory not found: {registries_root}", file=sys.stderr)
        sys.exit(1)
    
    networks = get_served_networks(registries_root)
    print(json.dumps({"networks": networks}))
