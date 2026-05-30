import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Login' });
  return { title: t('title') };
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;

  const user = await getCurrentUser();
  if (user) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('Login');

  return (
    <section className="container grid min-h-[calc(100vh-5rem)] place-items-center py-12">
      <div className="grid w-full max-w-2xl gap-7">
        <div className="animate-fade-up text-center">
          <p className="text-muted-foreground text-sm font-medium">{t('eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{t('title')}</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-base leading-7">
            {t('subtitle')}
          </p>
        </div>

        <LoginForm locale={locale} />
      </div>
    </section>
  );
}
