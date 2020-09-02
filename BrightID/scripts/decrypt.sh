#!/bin/sh

# To encrypt a file:
# > gpg --symmetric --cipher-algo AES256 path/to/your-secret

# Decrypt the keystore with passphrase passed in via Github Action Secret
gpg --quiet --batch --yes --decrypt --passphrase="$ENCRYPT_PASSWORD" \
--output ./android/app/brightid.keystore ./android/app/brightid.keystore.gpg

# Decrypt keystore.properties
gpg --quiet --batch --yes --decrypt --passphrase="$ENCRYPT_PASSWORD" \
--output ./android/keystore.properties ./android/keystore.properties.gpg

# Decrypt google-services.json
gpg --quiet --batch --yes --decrypt --passphrase="$ENCRYPT_PASSWORD" \
--output ./android/google-services.json ./android/google-services.json-prod.gpg


# Decrypt google key for publishing in app store
# gpg --quiet --batch --yes --decrypt --passphrase="$ENCRYPT_PASSWORD" \
# --output ./android/app/google-key.json ./android/app/google-key.json.gpg
