/**
 * @param {number|string} value
 * @param {number} fallback
 * @returns {number}
 */
export function toSeconds(value, fallback) {
  return toNumber(value, fallback) * 1000;
}

/**
 * @param {number|string} value
 * @param {number} fallback
 * @returns {number}
 */
export function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
