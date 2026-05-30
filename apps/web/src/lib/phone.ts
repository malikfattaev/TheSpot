import { createHash } from 'node:crypto';

/** Normalize a user-entered phone to digits, preserving a leading `+`. */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

/** A phone is acceptable when it carries 9–15 digits. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Phone-only accounts still need a unique email for the `User.email` column.
 * Derive a stable, collision-resistant placeholder from the phone number.
 */
export function phoneEmail(phone: string): string {
  const hash = createHash('sha256').update(phone).digest('hex').slice(0, 24);
  return `phone-${hash}@phone.thespot.local`;
}
