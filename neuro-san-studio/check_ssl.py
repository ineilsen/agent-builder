import certifi
import ssl
import urllib.request
import os

print(f"SSL_CERT_FILE: {os.environ.get('SSL_CERT_FILE')}")

try:
    print("Attempting connection to https://api.openai.com...")
    # This should use SSL_CERT_FILE automatically if set
    urllib.request.urlopen("https://api.openai.com")
    print("Connection successful!")
except Exception as e:
    print(f"Connection failed: {e}")
