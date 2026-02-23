#!/usr/bin/env python3
"""
Parse toolbox_info.hocon and return a list of available native tools.
Usage: python pyhocon_toolbox_parser.py <path_to_toolbox_info.hocon>
"""
import sys
import json
import re
import os

def parse_toolbox(content: str) -> list:
    """
    Parse native tools from toolbox_info.hocon.
    Returns a list of dicts: [{'id': '...', 'class': '...', 'description': '...'}]
    """
    tools = []
    
    # Simple strategy: look for top-level keys that look like strings in quotes followed by {
    # e.g., "anthropic_search": {
    # and then extract class and description. Since HOCON files can be deeply nested, we do a block search.
    
    # We strip comments to make parsing cleaner
    lines = []
    for line in content.split('\n'):
        # Keep quotes inside comments safe by just stripping after # if not inside quote... wait, simpler regex
        comment_pos = line.find('#')
        if comment_pos >= 0:
            line = line[:comment_pos]
        lines.append(line)
        
    clean_content = '\n'.join(lines)
    
    # Find all main blocks: "tool_name": {
    block_pattern = re.compile(r'"([^"]+)"\s*:\s*\{')
    
    # Iterate through all blocks found
    for match in block_pattern.finditer(clean_content):
        tool_id = match.group(1)
        
        # Don't capture known non-tool keys inside parameter blocks
        if tool_id in ["type", "properties", "items", "args", "kwargs", "parameters", "schema", "required", "input", "output", "jira_api_wrapper", "agent_name", "inquiry", "query", "to", "attachment_paths", "cc", "bcc", "subject", "message", "aspect_ratio", "image_size", "google_search", "search_terms", "media_type", "limit", "offset", "type", "k", "gl", "hl", "tbs", "app_name", "urls"]:
            continue
            
        # To get content, find the matching closing brace, or just use regex to extract the "class" and "description" directly after this position
        start_pos = match.end()
        
        # The next block could be nested, but we just need the first "class" and "description"
        # We can extract a substring of reasonable length (e.g. 1000 chars) to search in.
        search_area = clean_content[start_pos:start_pos+1000]
        
        class_match = re.search(r'"class"\s*:\s*"""([^"]+)"""|"class"\s*:\s*"([^"]+)"', search_area)
        desc_match = re.search(r'"description"\s*:\s*"""(.*?)"""|"description"\s*:\s*"([^"]+)"', search_area, re.DOTALL)
        
        tool_class = ""
        if class_match:
            tool_class = class_match.group(1) or class_match.group(2)
            
        tool_desc = ""
        if desc_match:
            tool_desc = desc_match.group(1) or desc_match.group(2)
            # clean up multiline """ descriptions
            tool_desc = re.sub(r'\s+', ' ', tool_desc).strip()
            
        if tool_class:
            tools.append({
                "id": tool_id,
                "class": tool_class,
                "description": tool_desc or f"{tool_id} tool"
            })
            
    return tools

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Missing path to toolbox_info.hocon'}))
        sys.exit(1)
        
    toolbox_path = sys.argv[1]
    
    if not os.path.exists(toolbox_path):
        print(json.dumps({'error': f'Toolbox file not found: {toolbox_path}'}))
        sys.exit(1)
        
    try:
        with open(toolbox_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        tools = parse_toolbox(content)
        
        # Output as JSON array for Vite middleware
        print(json.dumps(tools))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
