from google import genai
import google.auth

credentials, project_id = google.auth.default()
client = genai.Client(vertexai=True, project=project_id, location="us-central1")

for m in client.models.list(config={"location": "us-central1"}):
    if "gemini" in m.name.lower():
        print(m.name)
