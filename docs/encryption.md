## Encryption
Save files are encrypted using AES-256 in ECB mode. The encryption key is derived from a static base key, XOR'd with the user's Steam/Epic (user) ID (in little-endian byte order).

_All credit to [glacierpiece](https://github.com/glacierpiece/borderlands-4-save-utility) for encryption research. See that repo for examples._

#### Encryption/Decryption Steps:
1. **Key Derivation:**
   - Start with a 32-byte static base key.
   - **Steam ID:**  
     - The Steam ID is expected to be a 17-digit number.
     - It is converted to an 8-byte little-endian array (least significant byte first).
     - These 8 bytes are XOR'd with the first 8 bytes of the base key.
   - **Epic ID:**  
     - The Epic ID is a string (not a number).
     - It is converted to a UTF-16LE byte array (2 bytes per character).
     - The resulting bytes are XOR'd with the base key, up to the length of the key (32 bytes).
   - The final key is the base key with the appropriate bytes XOR'd as above.
2. **Encryption:**
   - The save data is padded using PKCS7 to a multiple of 16 bytes.
   - The padded data is encrypted with AES-256 in ECB mode using the derived key.
   - No IV or salt is used.
3. **Decryption:**
   - Reverse the process: decrypt with AES-256-ECB using the derived key, then remove PKCS7 padding.

### Key Derivation Differences: Steam vs Epic

| Platform | Input Format         | Conversion Method         | Bytes Used for XOR       |
|----------|---------------------|--------------------------|----------------------------|
| Steam    | 17-digit number     | 8-byte little-endian     | First 8 bytes of base key  |
| Epic     | String (any length) | UTF-16LE (2 bytes/char)  | Up to 32 bytes of base key |


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
