/**
 * Cryptography and compression module for .sav files.
 * Implements the game's save file format encryption and compression:
 * - AES-ECB encryption with user-specific key derivation
 * - PKCS7 padding
 * - zlib compression
 * - Checksum validation
 */

/**
 * Converts a string to UTF-16 little-endian byte array.
 * @param {string} str - The input string to convert
 * @returns {number[]} Array of bytes representing the string in UTF-16LE
 */
function utf16leBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes.push(code & 0xff, (code >> 8) & 0xff);
  }
  return bytes;
}

/**
 * Derives an encryption key from the user's platform ID.
 * Supports both Steam IDs (64-bit numbers) and Epic IDs (strings).
 * @param {string} userID - The user's Steam ID or Epic ID
 * @returns {number[]} 32-byte encryption key
 */
function deriveKey(userID) {
  const BASE_KEY = [
    0x35, 0xec, 0x33, 0x77, 0xf3, 0x5d, 0xb0, 0xea, 0xbe, 0x6b, 0x83, 0x11, 0x54, 0x03, 0xeb, 0xfb,
    0x27, 0x25, 0x64, 0x2e, 0xd5, 0x49, 0x06, 0x29, 0x05, 0x78, 0xbd, 0x60, 0xba, 0x4a, 0xa7, 0x87,
  ];
  let k = BASE_KEY.slice();

  let uid_bytes;
  if (/^\d{17,}$/.test(userID)) {
    // Steam ID: treat as 8-byte little-endian
    let sid = BigInt(userID);
    uid_bytes = [];
    for (let i = 0; i < 8; i++) {
      uid_bytes.push(Number(sid & 0xffn));
      sid >>= 8n;
    }
  } else {
    // Epic ID: UTF-16LE bytes
    uid_bytes = utf16leBytes(userID);
  }

  for (let i = 0; i < Math.min(k.length, uid_bytes.length); i++) {
    k[i] ^= uid_bytes[i];
  }
  return k;
}

/**
 * Removes PKCS7 padding from a buffer.
 * @param {Uint8Array} buf - The padded buffer
 * @returns {Uint8Array} The unpadded buffer
 */
function pkcs7Unpad(buf) {
  const pad = buf[buf.length - 1];
  // Check that all pad bytes are the same
  for (let i = 1; i <= pad; i++) {
    if (buf[buf.length - i] !== pad) {
      // Padding is invalid, return original buffer
      console.warn('PKCS7 unpad failed, returning padded data');
      return buf;
    }
  }
  return buf.slice(0, buf.length - pad);
}

function pkcs7Pad(buf, blockSize = 16) {
  const pad = blockSize - (buf.length % blockSize);
  const out = new Uint8Array(buf.length + pad);
  out.set(buf);
  out.fill(pad, buf.length);
  return out;
}

function uint8ArrayToWordArray(u8arr) {
  var words = [],
    i = 0,
    len = u8arr.length;
  for (; i < len; i += 4) {
    words.push((u8arr[i] << 24) | (u8arr[i + 1] << 16) | (u8arr[i + 2] << 8) | u8arr[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(words, len);
}

/**
 * Decrypts a .sav file and converts it to YAML.
 * Process: AES decrypt -> PKCS7 unpad -> zlib decompress -> YAML
 * @param {ArrayBuffer} fileArrayBuffer - The raw .sav file contents
 * @param {boolean} normalize - Whether to normalize the output YAML
 * @returns {string} The decrypted YAML content
 */
function decryptSav(fileArrayBuffer, normalize = true) {
  const userID = document.getElementById('userIdInput').value.trim();
  if (!userID) {
    alert('Please enter platform user ID (Steam or Epic).');
    return;
  }
  localStorage.setItem('bl4_previous_userid', userID);
  const ciph = new Uint8Array(fileArrayBuffer);

  const keyBytes = deriveKey(userID);
  const keyWordArray = uint8ArrayToWordArray(new Uint8Array(keyBytes));

  const ciphWordArray = uint8ArrayToWordArray(ciph);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphWordArray }, keyWordArray, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  let pt = new Uint8Array(decrypted.words.length * 4);
  for (let i = 0; i < decrypted.words.length; i++) {
    pt.set(
      [
        (decrypted.words[i] >> 24) & 0xff,
        (decrypted.words[i] >> 16) & 0xff,
        (decrypted.words[i] >> 8) & 0xff,
        decrypted.words[i] & 0xff,
      ],
      i * 4
    );
  }
  pt = pt.slice(0, ciph.length); // Remove possible extra bytes

  // Unpad PKCS7
  pt = pkcs7Unpad(pt);

  // After unpadding, try zlib inflate with different trims
  // Files may have 4 or 8 extra bytes at the end after padding
  // Try each option until one works
  let trimOptions = [4, 8];
  let inflated = null;
  let trimUsed = null;
  for (let trim of trimOptions) {
    try {
      let candidate = pt.slice(0, pt.length - trim);
      // Check for zlib header
      if (candidate[0] !== 0x78) continue;
      inflated = pako.inflate(candidate);
      trimUsed = trim;
      break;
    } catch (e) {
      // Try next trim value
    }
  }

  if (!inflated) {
    alert('Zlib decompress failed. Wrong user ID or file format?');
    return;
  }

  console.log(`Successfully decompressed with trim=${trimUsed}`);
  let yamlBytes = inflated;



  if (normalize) {
    return normalizeYaml(yamlBytes);
  }
  return new TextDecoder().decode(yamlBytes);
}

// Encrypt YAML to .sav
function encryptSav() {
  const file = document.getElementById('fileInput').files[0];
  const userID = document.getElementById('userIdInput').value.trim();
  if (!file || !userID) {
    alert('Please select a file and enter Steam/Epic ID.');
    return;
  }

  localStorage.setItem('bl4_previous_userid', userID);

  const yamlBytes = new TextEncoder().encode(editor.getValue());

  // Compress zlib
  const comp = pako.deflate(yamlBytes, { level: 9 });

  // Compute adler32
  function adler32(buf) {
    let a = 1,
      b = 0;
    for (let i = 0; i < buf.length; i++) {
      a = (a + buf[i]) % 65521;
      b = (b + a) % 65521;
    }
    return ((b << 16) | a) >>> 0;
  }
  const adler = adler32(yamlBytes);
  const uncompressedLen = yamlBytes.length;

  // Append adler32 and uncompressed length (both little-endian, 4 bytes each)
  const packed = new Uint8Array(comp.length + 8);
  packed.set(comp, 0);
  // adler32
  packed[comp.length + 0] = adler & 0xff;
  packed[comp.length + 1] = (adler >> 8) & 0xff;
  packed[comp.length + 2] = (adler >> 16) & 0xff;
  packed[comp.length + 3] = (adler >> 24) & 0xff;
  // uncompressed length
  packed[comp.length + 4] = uncompressedLen & 0xff;
  packed[comp.length + 5] = (uncompressedLen >> 8) & 0xff;
  packed[comp.length + 6] = (uncompressedLen >> 16) & 0xff;
  packed[comp.length + 7] = (uncompressedLen >> 24) & 0xff;

  // PKCS7 pad
  const pt_padded = pkcs7Pad(packed);

  // Derive key
  const keyBytes = deriveKey(userID);
  const keyWordArray = uint8ArrayToWordArray(new Uint8Array(keyBytes));

  // Encrypt AES-ECB
  const ptWordArray = CryptoJS.lib.WordArray.create(pt_padded);
  const encrypted = CryptoJS.AES.encrypt(ptWordArray, keyWordArray, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  // Convert to Uint8Array
  const encBytes = new Uint8Array(encrypted.ciphertext.words.length * 4);
  for (let i = 0; i < encrypted.ciphertext.words.length; i++) {
    encBytes.set(
      [
        (encrypted.ciphertext.words[i] >> 24) & 0xff,
        (encrypted.ciphertext.words[i] >> 16) & 0xff,
        (encrypted.ciphertext.words[i] >> 8) & 0xff,
        encrypted.ciphertext.words[i] & 0xff,
      ],
      i * 4
    );
  }

  // console.log("ENCRYPT VALIDATION (first 8):", Array.from(keyBytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')));
  // console.log("ENCRYPT VALIDATION (last 8):", Array.from(keyBytes.slice(-8)).map(b => b.toString(16).padStart(2, '0')));

  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14); // e.g. 20250924153012
  const exportFilename = `${importFilename}_${timestamp.slice(0, 8)}_${timestamp.slice(8)}.sav`;

  const blob = new Blob([encBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFilename;
  a.click();
  URL.revokeObjectURL(url);
}
