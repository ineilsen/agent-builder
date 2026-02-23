from google import genai
import google.auth

try:
    credentials, project_id = google.auth.default()
    print(f"Project: {project_id}")
    client = genai.Client(vertexai=True, project=project_id, location="us-central1")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Hello'
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
