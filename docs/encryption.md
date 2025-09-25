## Encryption
Save files are encrypted using AES-256 in ECB mode. The encryption key is derived from a static base key, XOR'd with the user's Steam/Epic (user) ID (in little-endian byte order).

_All credit to [glacierpiece](https://github.com/glacierpiece/borderlands-4-save-utility) for encryption research. See that repo for examples._

#### Encryption/Decryption Steps:
1. **Key Derivation:**
   - Start with a 32-byte static base key.
   - Convert the Steam/Epic ID to an 8-byte little-endian array.
   - XOR the first 8 bytes of the base key with the user ID bytes to produce the final key.
2. **Encryption:**
   - The save data is padded using PKCS7 to a multiple of 16 bytes.
   - The padded data is encrypted with AES-256 in ECB mode using the derived key.
   - No IV or salt is used.
3. **Decryption:**
   - Reverse the process: decrypt with AES-256-ECB using the derived key, then remove PKCS7 padding.

## Compression
Before encryption, the save data (YAML) is compressed using zlib with maximum compression (level=9).
After compression, two 4-byte values are appended:

- **adler32 checksum** of the original (uncompressed) YAML data (little-endian)
- **uncompressed length** of the YAML data (little-endian)

#### Compression Steps:
1. **Compress** the YAML data with zlib (level=9).
2. **Append:**
   - 4 bytes: adler32 checksum of the original YAML (little-endian)
   - 4 bytes: length of the original YAML (little-endian)
3. **Pad** the result to a multiple of 16 bytes using PKCS7 (for encryption).

#### Decompression Steps:
1. Remove PKCS7 padding after decryption.
2. Remove the last 8 bytes (adler32 and length).
3. Decompress the remaining data with zlib to recover the original YAML.
