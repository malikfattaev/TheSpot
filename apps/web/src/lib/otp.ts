/**
 * Temporary fixed verification code used by both login and registration until
 * real SMS delivery is wired up. Swap `DEV_OTP` for a generated code + SMS
 * provider when that lands; the call sites only depend on `isValidOtp`.
 */
export const DEV_OTP = '0000';

export function isValidOtp(code: string): boolean {
  return code.trim() === DEV_OTP;
}
