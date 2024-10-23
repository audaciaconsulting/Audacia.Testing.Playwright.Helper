import { request } from '@playwright/test';
import { promises as fs } from 'fs';

/**
 * Sets the authorization header for API requests.
 * 
 * This function attempts to read an existing token from a file. If the token exists and hasn't expired,
 * it returns the token in the authorization header. If the token doesn't exist or has expired, it fetches
 * a new token, writes it to the file, and returns the new token in the authorization header.
 * 
 * @param {any} TokenClass - The Token class provided by the host project.
 * @returns {Promise<{ accept: string, Authorization: string }>} An object containing the 'accept' and 'Authorization' headers.
 * 
 * @throws Will log an error if reading the token file fails.
 */
export async function setHeader(TokenClass: any): Promise<{ accept: string; Authorization: string; }> {
  let existingTokenData: any;
  const tokenFilePath = './.auth/token.json';

  try {
    // Attempt to read the file.
    const fileContents = await fs.readFile(tokenFilePath, 'utf-8');
    existingTokenData = JSON.parse(fileContents);
  } catch (error) {
    // If the file doesn't exist or any other error occurs, log it and set existingSessionData to null.
    console.info('Error reading session:', error);
    existingTokenData = null;
  }

  // If the token exists and hasn't expired, return the token.
  if (existingTokenData && existingTokenData.expires_at > Date.now()) {
    return { 'accept': 'application/json', 'Authorization': `Bearer ${existingTokenData.access_token}` };
  }

  // If the token doesn't exist or has expired, get a new token and write it to the file.
  const apiRequestContext = await request.newContext();
  const newTokenData = await (await new TokenClass(apiRequestContext).getToken()).json();
  newTokenData.expires_at = Date.now() + (newTokenData.expires_in * 1000);
  await fs.writeFile(tokenFilePath, JSON.stringify(newTokenData), 'utf-8');

  // Return the new token.
  return { 'accept': 'application/json', 'Authorization': `Bearer ${newTokenData.access_token}` };
}
