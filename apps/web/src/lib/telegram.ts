/**
 * Telegram handle helpers. Users paste their contact in many shapes —
 * `@nick`, `nick`, `t.me/nick`, `https://t.me/nick` — so we reduce all of them
 * to the bare handle for storage and rebuild the link where it's shown.
 */

/** Strip `@`, any `t.me/` prefix and surrounding noise → bare handle. */
export function normalizeTelegram(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^t(?:elegram)?\.me\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .trim();
}

/** Telegram handles are 5–32 chars of letters, digits and underscores. */
export function isValidTelegram(handle: string): boolean {
  return /^[A-Za-z0-9_]{5,32}$/.test(handle);
}

/** Public link to a handle, for the contact button. */
export function telegramUrl(handle: string): string {
  return `https://t.me/${handle}`;
}
