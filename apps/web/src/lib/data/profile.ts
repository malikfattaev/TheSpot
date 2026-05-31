/** The editable (and read-only) fields shown on the profile page. */
export type ProfileData = {
  fullName: string;
  phone: string | null;
  telegramUsername: string | null;
};

/** Load a user's profile for the edit form, or `null` if it can't be read. */
export async function getProfile(userId: string): Promise<ProfileData | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const { prisma } = await import('@thespot/db');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, phone: true, telegramUsername: true },
    });
    return user ?? null;
  } catch {
    return null;
  }
}
