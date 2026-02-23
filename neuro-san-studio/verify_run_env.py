from run import NeuroSanRunner
import os
import sys

# Mock sys.argv to avoid argument parsing errors if any
sys.argv = ["run.py", "--client-only"]

runner = NeuroSanRunner()
# We just want to test set_environment_variables
runner.set_environment_variables()

ssl_cert_file = os.environ.get("SSL_CERT_FILE")
requests_ca_bundle = os.environ.get("REQUESTS_CA_BUNDLE")

print(f"\nVERIFICATION RESULT:")
print(f"SSL_CERT_FILE: {ssl_cert_file}")
print(f"REQUESTS_CA_BUNDLE: {requests_ca_bundle}")

expected_path = os.path.join(runner.root_dir, "custom_cacert.pem")

if ssl_cert_file == expected_path and requests_ca_bundle == expected_path:
    print("SUCCESS: Environment variables set correctly.")
else:
    print("FAILURE: Environment variables NOT set correctly.")
