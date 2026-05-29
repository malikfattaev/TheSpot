import { useTranslations } from 'next-intl';

export function SiteFooter() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container flex h-16 items-center text-sm text-muted-foreground">
        © {year} The Spot. {t('rights')}
      </div>
    </footer>
  );
}
