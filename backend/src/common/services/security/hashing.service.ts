import { genSalt, hash as bHash, compare as bCompare } from "bcrypt";

/**
 *
 * @param {string} plaintext The data to be hashed.
 * @param {number} saltRounds The cost of processing the data. Default 10.
 * @param {"a" | "b"} minor The minor version of bcrypt to use. Either 'a' or 'b'. Default 'b'.
 * @returns {Promise<string>} A promise to be either resolved with the encrypted data salt or rejected with an Error
 */
export async function hash(
  plaintext: string,
  saltRounds: number = 10,
  minor: "a" | "b" = "b",
): Promise<string> {
  const salt = await genSalt(saltRounds, minor);
  return bHash(plaintext, salt);
}

/**
 *
 * @param {string} data The hashed data
 * @param {string} hash the data to be compared against
 * @returns {Promise<boolean>} A promise to be either resolved with the comparison result salt or rejected with an Error
 */
export async function compare(data: string, hash: string): Promise<boolean> {
  return bCompare(data, hash);
}
