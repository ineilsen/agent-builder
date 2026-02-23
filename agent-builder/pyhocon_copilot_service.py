import sys
import os
import json
from google import genai
from google.genai import types
import google.auth
from google.auth.exceptions import DefaultCredentialsError

# Try to load dotenv but don't fail if missing
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '../neuro-san-studio/.env'))
except ImportError:
    pass


UNIFIED_SYSTEM_PROMPT = """You are an expert AI Architect specializing in 'Neuro SAN' Agent networks, defined in HOCON format.
You will be given CURRENT_HOCON (the existing network) and USER_PROMPT (the requested change).

Your job is to:
1. Analyse the current network structure
2. Plan the changes needed
3. Generate the complete modified HOCON

You MUST return ONLY a single valid JSON object (no markdown, no extra text) with this EXACT schema:
{
  "plan": {
    "title": "Short, descriptive title of the change (max 8 words)",
    "description": "1-2 sentence plain English explanation of what changes and why",
    "changes": [
      "Specific change 1 (e.g. 'Added BillingAgent with Stripe tool')",
      "Specific change 2",
      "..."
    ],
    "agents": {
      "existing": ["ExistingAgent1", "ExistingAgent2"],
      "new": ["NewAgentName"]
    },
    "tools": {
      "existing": ["/tools/existing_tool"],
      "new": ["/tools/new_tool"]
    },
    "connections": [
      ["AgentA", "AgentB"],
      ["AgentB", "NewAgentC"]
    ],
    "hocon": "...the complete, full, modified HOCON file content as a string..."
  }
}

HOCON Rules:
- The `hocon` field must contain the ENTIRE file - do NOT truncate it
- If an agent is strictly a function (leaf node), it MUST NOT have an `instructions` key
- Maintain existing syntax (e.g. `include "registries/aaosa.hocon"`, `${aaosa_call}`, etc.)
- Ensure all brackets, braces and commas are perfectly balanced
- DO NOT lose any existing agents
- `connections` should represent the agent-to-agent call graph (who calls whom)
"""


def generate_hocon_update(file_path, prompt):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            current_hocon = f.read()
    except Exception as e:
        print(json.dumps({"error": f"Failed to read HOCON file: {e}"}), file=sys.stderr)
        sys.exit(1)

    client = None

    try:
        credentials, project_id = google.auth.default()
        if project_id:
            client = genai.Client(vertexai=True, project=project_id, location="us-central1")
        else:
            raise Exception("No project_id found in ADC.")
    except Exception as adc_err:
        API_KEY = os.environ.get("GOOGLE_API_KEY", "")
        if API_KEY:
            client = genai.Client(api_key=API_KEY)
        else:
            print(json.dumps({"error": f"Auth failed. No ADC or API_KEY found. ADC Error: {adc_err}"}), file=sys.stderr)
            sys.exit(1)

    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=f"CURRENT_HOCON:\n{current_hocon}\n\nUSER_PROMPT:\n{prompt}",
            config=types.GenerateContentConfig(
                system_instruction=UNIFIED_SYSTEM_PROMPT,
                response_mime_type="application/json",
            )
        )

        res_text = response.text.strip()

        # Strip any accidental markdown fences
        if res_text.startswith("```json"):
            res_text = res_text[7:]
            if res_text.endswith("```"):
                res_text = res_text[:-3]
        elif res_text.startswith("```"):
            res_text = res_text[3:]
            if res_text.endswith("```"):
                res_text = res_text[:-3]

        parsed = json.loads(res_text.strip())

        # Validate structure
        if "plan" not in parsed:
            raise ValueError("Response missing 'plan' key")

        print(json.dumps(parsed))

    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "403" in error_msg or "API_KEY_INVALID" in error_msg:
            print(json.dumps({"error": "Auth Error: Invalid API Key or blocked project permissions."}), file=sys.stderr)
        else:
            print(json.dumps({"error": f"Gemini Generation Failed: {e}"}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: pyhocon_copilot_service.py <file_path> <prompt>"}), file=sys.stderr)
        sys.exit(1)

    generate_hocon_update(sys.argv[1], sys.argv[2])
