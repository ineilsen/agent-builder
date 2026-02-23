import sys
import re
import os

def update_agent_instructions(file_path, agent_name, new_instructions):
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        return False

    with open(file_path, 'r') as f:
        content = f.read()

    # Strategy:
    # 1. Find the block for the specific agent. 
    #    Look for name = "agent_name" or name = agent_name
    # 2. Within that block (or scanning generally if unique), find the `instructions` field.
    #    This is tricky because HOCON is flexible.
    #    However, in our specific NHS structure, it's fairly consistent:
    #    {
    #       name = "AgentName"
    #       instructions = """..."""
    #       ...
    #    }
    
    # Let's try to locate the agent name first
    # This regex looks for: name\s*=\s*"?AGENT_NAME"?
    name_pattern = re.compile(f'name\\s*=\\s*"?{re.escape(agent_name)}"?')
    name_match = name_pattern.search(content)

    if not name_match:
        print(f"Error: Agent '{agent_name}' not found in {file_path}", file=sys.stderr)
        # Fallback: maybe it's defined differently?
        return False

    # Start searching for 'instructions' AFTER the name match
    # We need to be careful not to bleed into another agent's block.
    # We can scan forward until we hit 'instructions'.
    
    # Better approach might be to find the 'instructions' line that follows the name match closely.
    # Or, if instructions come first? Standard is usually name then instructions.
    
    # Let's assume standard format for now:
    # Look for 'instructions = ' after the name_match index
    # We need to handle optional whitespace and optional assignment chars (?)
    
    # Regex for instructions start: instructions\s*=\s*(?:\$\{.*\}|\"\"\")
    # We specifically want to replace the triple-quoted string content
    
    # Let's find the start of the instructions block after the name
    offset = name_match.end()
    remaining_content = content[offset:]
    
    # Pattern to find 'instructions =' assignment
    instr_key_pattern = re.compile(r'instructions\s*=\s*')
    instr_match = instr_key_pattern.search(remaining_content)
    
    if not instr_match:
        # Maybe instructions came BEFORE name? (Unlikely in our manifests but possible in HOCON)
        # Let's assume standard order for now.
        print(f"Error: 'instructions' field not found for agent '{agent_name}'", file=sys.stderr)
        return False
    
    instr_start_idx = offset + instr_match.end()
    
    # Check what comes next. It should be quotes.
    # We expect triple quotes """
    if content[instr_start_idx:instr_start_idx+3] != '"""':
        # Might be single quote? or variable ref?
        # If it's a variable ref ${...}, we probably shouldn't edit it directly unless we resolve it?
        # Requirement says "Update prompt". If it's a variable, we might need to find where that variable is defined.
        # BUT, if we simply overwrite the variable ref with a literal string, that works too (though breaks reuse).
        # Let's support overwriting whatever is there with a new triple quoted string.
        pass
        
    # We want to replace whatever is the value of instructions with new_instructions wrapped in """
    # Value ends at the next unquoted newline or matching quote? 
    # If it is currently """...""", we find the closing """.
    # If it is "...", we find closing ".
    # If it is ${...}, we find end of line or next field?
    
    # Simplify: We only support editing agents that have explicit string instructions or we will overwrite.
    # To do this safely, we usually look for the start of the value and the end of the value.
    
    # If existing is """, find closing """
    if content[instr_start_idx:instr_start_idx+3] == '"""':
        # Find closing """
        # We need to skip the opening ones
        closing_idx = content.find('"""', instr_start_idx + 3)
        if closing_idx == -1:
            print("Error: Malformed HOCON, closing quotes not found", file=sys.stderr)
            return False
        
        # Replace content
        # Check if there is an appended variable like ${aaosa_instructions} after the closing quotes?
        # In coffee_finder: """...""" ${aaosa_instructions}
        # We should PRESERVE the ${aaosa_instructions} if we can.
        
        # Actually, let's just replace the text inside the triple quotes.
        # Why? Because that's the "System Prompt" part. The suffix variable is likely standard.
        
        prefix = content[:instr_start_idx + 3]
        suffix = content[closing_idx:]
        
        # Construct new content
        # Ensure new instructions escapes triple quotes if any (unlikely in prompts but possible)
        sanitized_new = new_instructions.replace('"""', '\\"\\"\\"')
        
        new_content = prefix + "\n" + sanitized_new + "\n" + suffix
        
        with open(file_path, 'w') as f:
            f.write(new_content)
            
        return True
        
    else:
        print("Error: Target instructions are not in triple-quote format. Editing not supported yet to avoid breaking variable logic.", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python pyhocon_updater_service.py <file_path> <agent_name> <new_instructions>", file=sys.stderr)
        sys.exit(1)

    path = sys.argv[1]
    agent = sys.argv[2]
    # Instructions might contain newlines, passing as single arg from shell might be tricky.
    # Better to read from stdin or file.
    # Given we spawn from node, we can pass as an argument if escaped properly, or via stdin.
    # Let's try reading the last argument as the prompt.
    prompt = sys.argv[3]
    
    success = update_agent_instructions(path, agent, prompt)
    if success:
        print("Success")
        sys.exit(0)
    else:
        sys.exit(1)
