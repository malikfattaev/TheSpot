import { z } from 'zod';

/**
 * Validated, typed access to public environment variables. Centralising this
 * keeps configuration out of components and fails fast on misconfiguration.
 * Server-only secrets (e.g. DATABASE_URL) are validated where they are used.
 */
// Treat empty strings as "unset" so defaults apply. Docker's
// `ENV X=${X}` bakes an empty string when a build arg is missing, which
// would otherwise fail `.url()` instead of falling back to the default.
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default('http://localhost:3000'),
  ),
});

export const env = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
