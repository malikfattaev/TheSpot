import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { RegisterForm } from './register-form';

export const dynamic = 'force-dynamic';

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Register' });
  return { title: t('title') };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;

  const user = await getCurrentUser();
  if (user) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('Register');

  return (
    <section className="container flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
      <div className="mx-auto grid w-full max-w-2xl gap-7">
        <div className="animate-fade-up text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{t('title')}</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-base leading-7">
            {t('subtitle')}
          </p>
        </div>

        <RegisterForm locale={locale} />
      </div>
    </section>
  );
}
