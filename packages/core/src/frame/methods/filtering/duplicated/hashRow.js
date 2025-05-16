/**
 * Calculates hash for a row for fast comparison using FNV-1a
 *
 * @param {any[]} rowValues - Row values
 * @returns {number} - Hash value
 */
export function hashRow(rowValues) {
  // FNV-1a hash function
  const FNV_PRIME = 0x01000193;
  const FNV_OFFSET_BASIS = 0x811c9dc5;

  let hash = FNV_OFFSET_BASIS;

  for (let i = 0; i < rowValues.length; i++) {
    const val = rowValues[i];

    // Hash based on value type
    if (val === null) {
      hash ^= 0;
      hash = Math.imul(hash, FNV_PRIME);
    } else if (val === undefined || (typeof val === 'number' && isNaN(val))) {
      hash ^= 1;
      hash = Math.imul(hash, FNV_PRIME);
    } else if (typeof val === 'number') {
      // Hash number as 8 bytes (64 bits)
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setFloat64(0, val, true);

      for (let j = 0; j < 8; j++) {
        hash ^= view.getUint8(j);
        hash = Math.imul(hash, FNV_PRIME);
      }
    } else if (typeof val === 'string') {
      // Hash string by characters
      for (let j = 0; j < val.length; j++) {
        hash ^= val.charCodeAt(j);
        hash = Math.imul(hash, FNV_PRIME);
      }
    } else if (typeof val === 'boolean') {
      hash ^= val ? 1 : 0;
      hash = Math.imul(hash, FNV_PRIME);
    } else if (Array.isArray(val)) {
      // For arrays, hash each element recursively
      hash ^= 2; // Marker for array type
      hash = Math.imul(hash, FNV_PRIME);

      // Hash array length
      hash ^= val.length;
      hash = Math.imul(hash, FNV_PRIME);

      // Hash each element
      for (let j = 0; j < val.length; j++) {
        // Recursive call for array elements
        const elementHash = hashRow([val[j]]);
        hash ^= elementHash;
        hash = Math.imul(hash, FNV_PRIME);
      }
    } else if (typeof val === 'object') {
      // For objects, hash keys and values
      hash ^= 3; // Marker for object type
      hash = Math.imul(hash, FNV_PRIME);

      // Get sorted keys for consistent hashing
      const keys = Object.keys(val).sort();

      // Hash number of keys
      hash ^= keys.length;
      hash = Math.imul(hash, FNV_PRIME);

      // Hash each key-value pair
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];

        // Hash key
        for (let k = 0; k < key.length; k++) {
          hash ^= key.charCodeAt(k);
          hash = Math.imul(hash, FNV_PRIME);
        }

        // Hash value (recursive call)
        const valueHash = hashRow([val[key]]);
        hash ^= valueHash;
        hash = Math.imul(hash, FNV_PRIME);
      }
    } else {
      // For other types, convert to string and hash
      const str = String(val);
      for (let j = 0; j < str.length; j++) {
        hash ^= str.charCodeAt(j);
        hash = Math.imul(hash, FNV_PRIME);
      }
    }
  }

  return hash >>> 0; // Convert to unsigned 32-bit integer
}
