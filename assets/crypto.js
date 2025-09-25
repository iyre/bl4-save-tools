// functions for encrypting/decrypting Borderlands 4 .sav files in the browser

function deriveKey(steamid) {
  const BASE_KEY = [
    0x35,0xEC,0x33,0x77,0xF3,0x5D,0xB0,0xEA,0xBE,0x6B,0x83,0x11,0x54,0x03,0xEB,0xFB,
    0x27,0x25,0x64,0x2E,0xD5,0x49,0x06,0x29,0x05,0x78,0xBD,0x60,0xBA,0x4A,0xA7,0x87
  ];
  let sid = BigInt(steamid.replace(/\D/g, ''));
  let sid_le = [];
  for (let i = 0; i < 8; i++) {
    sid_le.push(Number(sid & 0xFFn));
    sid >>= 8n;
  }
  let k = BASE_KEY.slice();
  for (let i = 0; i < 8; i++) k[i] ^= sid_le[i];
  return k;
}

function pkcs7Unpad(buf) {
  const pad = buf[buf.length - 1];
  // Check that all pad bytes are the same
  for (let i = 1; i <= pad; i++) {
    if (buf[buf.length - i] !== pad) {
      // Padding is invalid, return original buffer (like Python fallback)
      console.warn("PKCS7 unpad failed, returning padded data");
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
  var words = [], i = 0, len = u8arr.length;
  for (; i < len; i += 4) {
    words.push(
      (u8arr[i] << 24) |
      (u8arr[i + 1] << 16) |
      (u8arr[i + 2] << 8) |
      (u8arr[i + 3])
    );
  }
  return CryptoJS.lib.WordArray.create(words, len);
}

// Decrypt .sav to YAML
function decryptSav(fileArrayBuffer) {
  const steamid = document.getElementById('steamIdInput').value.trim();
  if (!steamid) { alert("Please enter platform user ID (Steam or Epic)."); return; }
  const ciph = new Uint8Array(fileArrayBuffer);

  // Derive key
  const keyBytes = deriveKey(steamid);
  const keyWordArray = uint8ArrayToWordArray(new Uint8Array(keyBytes));

  // Decrypt AES-ECB
  const ciphWordArray = uint8ArrayToWordArray(ciph);
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphWordArray },
    keyWordArray,
    { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
  );
  let pt = new Uint8Array(decrypted.words.length * 4);
  for (let i = 0; i < decrypted.words.length; i++) {
    pt.set([
      (decrypted.words[i] >> 24) & 0xFF,
      (decrypted.words[i] >> 16) & 0xFF,
      (decrypted.words[i] >> 8) & 0xFF,
      decrypted.words[i] & 0xFF
    ], i * 4);
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
    alert("Zlib decompress failed. Wrong user ID or file format?");
    return;
  }

  console.log(`Successfully decompressed with trim=${trimUsed}`);
  let yamlBytes = inflated;

  // console.log("DECRYPT VALIDATION (first 8):", Array.from(keyBytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')));
  // console.log("DECRYPT VALIDATION (last 8):", Array.from(keyBytes.slice(-8)).map(b => b.toString(16).padStart(2, '0')));

  let yamlText = new TextDecoder().decode(yamlBytes);
  console.log("YAML preview:", new TextDecoder().decode(yamlBytes).slice(0, 100));
  console.log("YAML length:", yamlBytes.length);

  // Remove !tags and any other unknown tags after a colon
  yamlText = yamlText.replace(/:\s*!tags/g, ':');
  // Optionally, generalize: yamlText = yamlText.replace(/:\s*!\w+/g, ':');
  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (e) {
    alert("Failed to parse YAML after tag removal: " + e);
    return;
  }

  // Dump back to YAML to normalize indentation and formatting
  let normalizedYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });

  // Set editor content to YAML text
  editor.setValue(normalizedYaml);
  document.getElementById('yamlSection').style.display = '';
}

// Encrypt YAML to .sav
function encryptSav() {
  const file = document.getElementById('savInput').files[0];
  const steamid = document.getElementById('steamIdInput').value.trim();
  if (!file || !steamid) { alert("Please select a file and enter Steam/Epic ID."); return; }

  const yamlBytes = new TextEncoder().encode(editor.getValue());

  // Compress zlib
  const comp = pako.deflate(yamlBytes, { level: 9 });

  // Compute adler32
  function adler32(buf) {
    let a = 1, b = 0;
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
  packed[comp.length + 0] = adler & 0xFF;
  packed[comp.length + 1] = (adler >> 8) & 0xFF;
  packed[comp.length + 2] = (adler >> 16) & 0xFF;
  packed[comp.length + 3] = (adler >> 24) & 0xFF;
  // uncompressed length
  packed[comp.length + 4] = uncompressedLen & 0xFF;
  packed[comp.length + 5] = (uncompressedLen >> 8) & 0xFF;
  packed[comp.length + 6] = (uncompressedLen >> 16) & 0xFF;
  packed[comp.length + 7] = (uncompressedLen >> 24) & 0xFF;

  // PKCS7 pad
  const pt_padded = pkcs7Pad(packed);

  // Derive key
  const keyBytes = deriveKey(steamid);
  const keyWordArray = uint8ArrayToWordArray(new Uint8Array(keyBytes));

  // Encrypt AES-ECB
  const ptWordArray = CryptoJS.lib.WordArray.create(pt_padded);
  const encrypted = CryptoJS.AES.encrypt(
    ptWordArray,
    keyWordArray,
    { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
  );
  // Convert to Uint8Array
  const encBytes = new Uint8Array(encrypted.ciphertext.words.length * 4);
  for (let i = 0; i < encrypted.ciphertext.words.length; i++) {
    encBytes.set([
      (encrypted.ciphertext.words[i] >> 24) & 0xFF,
      (encrypted.ciphertext.words[i] >> 16) & 0xFF,
      (encrypted.ciphertext.words[i] >> 8) & 0xFF,
      encrypted.ciphertext.words[i] & 0xFF
    ], i * 4);
  }

  // console.log("ENCRYPT VALIDATION (first 8):", Array.from(keyBytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')));
  // console.log("ENCRYPT VALIDATION (last 8):", Array.from(keyBytes.slice(-8)).map(b => b.toString(16).padStart(2, '0')));

  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14); // e.g. 20250924153012
  const exportFilename = `${importFilename}_${timestamp.slice(0, 8)}_${timestamp.slice(8)}.sav`;

  const blob = new Blob([encBytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFilename;
  a.click();
  URL.revokeObjectURL(url);
}
