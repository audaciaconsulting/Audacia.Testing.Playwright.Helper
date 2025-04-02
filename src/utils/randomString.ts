/** 
 * Generates a random string with the specified length.
 * @param {number} strLength - The length of the random string to generate. Must be a positive integer.
 * @returns {string} The randomly generated string of the specified length.
 */
export function randomString(strLength: number): string {
  if (!Number.isInteger(strLength) || strLength <= 0) {
    throw new Error('strLength must be a positive integer');
  }
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  let randomString = '';

  for (let i = 0; i < strLength; i += 1) {
    const index = Math.floor(Math.random() * charactersLength);
    randomString += characters.charAt(index);
  }

  return randomString;
}
