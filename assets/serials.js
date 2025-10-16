/**
 * Serial manipulation and encoding module.
 * Handles Borderlands 4 item serial decoding, encoding, and level updating.
 * - Custom base85 encoding/decoding
 * - Bitwise operations for serial manipulation
 * - Varint chunk parsing and encoding
 * - Bulk item level updating for save files
 */

/**
 * Custom base85 alphabet used for serial encoding.
 * @const {string}
 */
const CUSTOM_B85_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~';

/**
 * Bit pattern prefix used to locate the level varint in the serial binary string.
 * @const {string}
 */
const LEVEL_PREFIX = '0110000000011001000001100';

/**
 * Decodes a custom base85-encoded serial string into a Uint8Array of bytes.
 * Handles padding and character replacement for compatibility.
 * @param {string} data - The base85-encoded serial string
 * @returns {Uint8Array} Decoded byte array
 */
function customBase85Decode(data) {
  if (data.startsWith('@U')) data = data.slice(2);
  data = data.replace(/\//g, '|');
  let padLen = (5 - (data.length % 5)) % 5;
  data += CUSTOM_B85_ALPHABET[CUSTOM_B85_ALPHABET.length - 1].repeat(padLen);
  let out = [];
  for (let i = 0; i < data.length; i += 5) {
    let chunk = data.slice(i, i + 5);
    let acc = 0;
    for (let c of chunk) {
      acc = acc * 85 + CUSTOM_B85_ALPHABET.indexOf(c);
    }
    for (let j = 3; j >= 0; j--) {
      out.push((acc >> (8 * j)) & 0xff);
    }
  }
  if (padLen) out = out.slice(0, -padLen);
  return Uint8Array.from(out);
}

/**
 * Reverses the bit order in a single byte.
 * Used for serial encoding/decoding compatibility.
 * @param {number} b - Byte to reverse
 * @returns {number} Byte with bits reversed
 */
function reverseBitsInByte(b) {
  let rev = 0;
  for (let i = 0; i < 8; i++) {
    rev = (rev << 1) | (b & 1);
    b >>= 1;
  }
  return rev;
}

/**
 * Parses the level varint from a serial binary string using chunked encoding.
 * @param {string} binaryStr - Binary string representation of the serial
 * @returns {Object} Parsed value and chunk positions
 * @throws {Error} If LEVEL_PREFIX is not found or parsing fails
 */
function parseVarintChunks(binaryStr) {
  let idx = binaryStr.indexOf(LEVEL_PREFIX);
  if (idx === -1) throw new Error('LEVEL_PREFIX not found in binary string');
  let pos = idx + LEVEL_PREFIX.length;
  let valueBits = '';
  while (true) {
    let chunk = binaryStr.slice(pos, pos + 5);
    if (chunk.length < 5) throw new Error('Unexpected end of binary string while parsing varint');
    let dataBits = chunk.slice(0, 4);
    let cont = chunk[4] === '1';
    valueBits += dataBits;
    pos += 5;
    if (!cont) break;
  }
  let value = parseInt(valueBits.split('').reverse().join(''), 2);
  return { value, start: idx + LEVEL_PREFIX.length, end: pos };
}

/**
 * Encodes an integer value into chunked varint format for serials.
 * @param {number} value - Integer value to encode
 * @returns {string} Encoded chunked varint string
 */
function encodeVarintChunks(value) {
  let bits = value.toString(2).padStart(8, '0').split('').reverse().join('');
  bits = bits.replace(/0+$/, '');
  if (bits.length < 4) bits = bits.padEnd(4, '0');
  let chunks = [];
  for (let i = 0; i < bits.length; i += 4) {
    chunks.push(bits.slice(i, i + 4));
  }
  let out = '';
  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i].padEnd(4, '0');
    let cont = i < chunks.length - 1 ? '1' : '0';
    out += chunk + cont;
  }
  return out;
}

/**
 * Converts a binary string to a Uint8Array of bytes.
 * Pads the string to a multiple of 8 bits if necessary.
 * @param {string} bits - Binary string
 * @returns {Uint8Array} Byte array
 */
function bitsToBytes(bits) {
  if (bits.length % 8 !== 0) bits = bits.padEnd(bits.length + (8 - (bits.length % 8)), '0');
  let bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Uint8Array.from(bytes);
}

/**
 * Encodes a Uint8Array of bytes into a custom base85 serial string.
 * Handles padding and trims encoded characters corresponding to padding bytes.
 * @param {Uint8Array} data - Byte array to encode
 * @returns {string} Base85-encoded serial string
 */
function bytesToCustomB85(data) {
  let padLen = (4 - (data.length % 4)) % 4;
  let padded = new Uint8Array(data.length + padLen);
  padded.set(data);
  let out = '';
  for (let i = 0; i < padded.length; i += 4) {
    let acc = 0;
    for (let j = 0; j < 4; j++) {
      acc = ((acc << 8) | padded[i + j]) >>> 0; // force unsigned
    }
    let chars = [];
    for (let k = 0; k < 5; k++) {
      chars.push(CUSTOM_B85_ALPHABET[acc % 85]);
      acc = Math.floor(acc / 85);
    }
    out += chars.reverse().join('');
  }
  if (padLen > 0) {
    const charsToTrim = Math.floor((padLen * 5) / 4);
    out = out.slice(0, out.length - charsToTrim);
  }
  return out;
}

/**
 * Updates the level value in an item serial string.
 * Decodes, modifies, and re-encodes the serial with the new level.
 * @param {string} serial - Original item serial string
 * @param {number} newLevel - Desired level value
 * @returns {string} Updated serial string
 */
function updateSerialLevel(serial, newLevel) {
  let decoded = customBase85Decode(serial);
  let reversedBytes = Uint8Array.from(decoded, reverseBitsInByte);
  let binaryStr = Array.from(reversedBytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('');
  let { value: oldLevel, start, end } = parseVarintChunks(binaryStr);
  let newVarintBits = encodeVarintChunks(newLevel);
  let newBinaryStr = binaryStr.slice(0, start) + newVarintBits + binaryStr.slice(end);
  let newBytes = bitsToBytes(newBinaryStr);
  let restoredBytes = Uint8Array.from(newBytes, reverseBitsInByte);
  let b85Str = bytesToCustomB85(restoredBytes).replace(/\|/g, '/');
  let newSerial = '@U' + b85Str;
  if (Math.abs(newSerial.length - serial.length) > 1) {
    console.warn(
      `Serial length differs by more than 1 byte, keeping old value: '${newSerial}' (new) vs '${serial}' (old)`
    );
    return serial;
  }
  return newSerial;
}

/**
 * Processes an inventory slot or array of slots, updating serials to the specified level.
 * Handles both single objects and arrays of objects.
 * @param {Object|Array} slot - Inventory slot(s) to process
 * @param {number} level - Level to set in serials
 */
function processSlot(slot, level) {
  if (Array.isArray(slot)) {
    slot.forEach((item) => {
      if (item && typeof item === 'object' && item.serial) {
        item.serial = updateSerialLevel(item.serial, level);
      }
    });
  } else if (slot && typeof slot === 'object' && slot.serial) {
    slot.serial = updateSerialLevel(slot.serial, level);
  }
}

/**
 * Updates all item serials in the save data to the specified level.
 * Handles both profile and character save formats.
 * Serial values are updated in-place and YAML is re-serialized to the editor.
 */
function updateAllSerialLevels() {
  const data = getYamlDataFromEditor();
  if (!data) return;

  let level = 50;
  if (isProfileSave) {
    Object.values(data.domains.local.shared.inventory.items.bank).forEach((slot) => {
      processSlot(slot, level);
    });
  } else {
    if (!data.state || !data.state.experience) return;
    const idx = data.state.experience.findIndex((exp) => exp.type === 'Character');
    if (idx === -1) {
      console.log('Character experience entry not found.');
      return;
    }
    level = data.state.experience[idx].level;
    Object.values(data.state.inventory.items.backpack).forEach((slot) => {
      processSlot(slot, level);
    });
    Object.values(data.state.inventory.equipped_inventory.equipped).forEach((slot) => {
      processSlot(slot, level);
    });
  }

  const newYaml = jsyaml.dump(data, { lineWidth: -1, noRefs: true });
  editor.setValue(newYaml);
  console.log('Item serials updated to level ' + level);
}
