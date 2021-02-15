/**
 * Removes the spaces, the accents and converts to lower case.
 * https://stackoverflow.com/a/37511463
 */

/**
 * 
 * @param {string} str 
 * @returns {string}
 */
export const toSearchString = (str) => {
  return str
    .replace(/\s/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};