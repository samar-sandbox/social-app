import { randomInt } from "node:crypto";

/**
 * Generates a random 6-digit OTP (One-Time Password).
 * @returns {string} A 6-digit OTP as a string, padded with leading zeros if necessary.
 */
export function getOTP(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}
