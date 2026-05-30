import type { UserRole } from '@thespot/db/roles';

/** The currently signed-in user, as needed by the UI. */
export type SessionUser = {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
};

/**
 * Single source of truth for "who is signed in".
 *
 * Authentication is not wired up yet, so this returns a development stub.
 * When real auth lands, replace the body with session/cookie lookup — every
 * caller (header, profile menu, guarded pages) keeps working unchanged.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return {
    id: 'stub-user',
    fullName: 'Алишер Алиев',
    phone: '+998 90 123 45 67',
    role: 'OWNER',
  };
}
