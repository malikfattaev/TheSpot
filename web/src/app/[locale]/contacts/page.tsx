import type { Metadata } from 'next';
import { Mail, Phone, Send } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ContactsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contacts' });
  return { title: t('title') };
}

export default async function ContactsPage({ params }: ContactsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Contacts');

  const channels = [
    { key: 'email', icon: Mail, value: t('email'), href: `mailto:${t('email')}` },
    { key: 'phone', icon: Phone, value: t('phone'), href: `tel:${t('phone').replace(/\s/g, '')}` },
    {
      key: 'telegram',
      icon: Send,
      value: t('telegram'),
      href: `https://t.me/${t('telegram').replace('@', '')}`,
    },
  ] as const;

  return (
    <section className="container py-20">
      <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <p
        className="animate-fade-up mt-4 max-w-xl text-muted-foreground"
        style={{ animationDelay: '60ms' }}
      >
        {t('subtitle')}
      </p>

      <div className="animate-fade-up mt-10 grid max-w-xl gap-4" style={{ animationDelay: '120ms' }}>
        {channels.map(({ key, icon: Icon, value, href }) => (
          <a
            key={key}
            href={href}
            className="surface flex items-center gap-4 rounded-2xl p-5 transition-colors duration-300 ease-smooth hover:bg-foreground/5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-medium tracking-tight">{value}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
