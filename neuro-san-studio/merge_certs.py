import certifi
import os

zscaler_certs_path = 'zscaler_certs.txt'
certifi_path = certifi.where()
output_path = 'custom_cacert.pem'

print(f"Reading certifi from {certifi_path}")
with open(certifi_path, 'r') as f:
    ca_content = f.read()

import re

system_certs_path = 'system_certs.pem'

print(f"Reading System certs from {system_certs_path}")
with open(system_certs_path, 'r') as f:
    zscaler_content = f.read()

# Extract only PEM blocks
certs = re.findall(r'-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----', zscaler_content, re.DOTALL)
clean_zscaler_content = "\n".join(certs)

final_content = ca_content + "\n" + clean_zscaler_content

print(f"Writing concatenated certs to {output_path}")
with open(output_path, 'w') as f:
    f.write(final_content)

print(f"Done. Set SSL_CERT_FILE={os.path.abspath(output_path)}")
