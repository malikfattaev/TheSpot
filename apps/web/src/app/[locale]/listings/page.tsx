import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type ListingsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The home page is the listings feed, so `/listings` is just an alias — forward
 * any incoming filters there. Individual listings live at `/listings/[id]`.
 */
export default async function ListingsPage({ params, searchParams }: ListingsPageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  const query = new URLSearchParams();
  for (const key of ['rooms', 'district', 'maxPrice', 'currency']) {
    const value = sp[key];
    const single = Array.isArray(value) ? value[0] : value;
    if (single) query.set(key, single);
  }

  const suffix = query.toString();
  redirect(`/${locale}${suffix ? `?${suffix}` : ''}`);
}
