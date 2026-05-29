import type { UserRole } from '@prisma/client';

export type { UserRole };

/** Roles allowed to publish listings. */
export const PUBLISHER_ROLES = ['OWNER', 'REALTOR'] as const satisfies readonly UserRole[];

/** Whether a role may create and manage listings. */
export function canPublishListings(role: UserRole): boolean {
  return (PUBLISHER_ROLES as readonly UserRole[]).includes(role);
}
