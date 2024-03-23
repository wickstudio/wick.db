/**
 * @param {string} key 
 * @returns {boolean}
 */
function isValidKey(key) {
  const isValid = typeof key === 'string' && key.trim() !== '';
  if (!isValid) {
    console.error(`Invalid key: "${key}". Key must be a non-empty string.`);
  }
  return isValid;
}

/**
 * @param {any} value
 * @returns {boolean}
 */
function isSerializable(value) {
  try {
    JSON.stringify(value);
    return true;
  } catch (err) {
    console.error('Error serializing value:', err);
    return false;
  }
}

module.exports = {
  isValidKey,
  isSerializable
};
