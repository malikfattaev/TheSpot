/**
 * Pretty-print a phone number for display. Uzbek numbers (`998` + 9 digits) are
 * grouped as `+998 90 123 45 67`; anything else keeps a leading `+`.
 *
 * Client-safe — no node-only imports (unlike `lib/phone`, which pulls in
 * `node:crypto`), so client components can use it too.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('998')) {
    const d = digits.slice(3);
    return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
  }

  if (!digits) return value;
  return value.trim().startsWith('+') ? `+${digits}` : digits;
}
