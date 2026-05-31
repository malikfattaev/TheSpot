'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { updateProfile, type ProfileInput } from '@/app/[locale]/profile/actions';

const fieldClass =
  'border-border bg-background focus:border-foreground/30 h-12 w-full rounded-2xl border px-4 text-sm outline-none transition-colors';
const labelClass = 'text-muted-foreground text-sm font-medium';

export type ProfileFormInitial = {
  fullName: string;
  phone: string;
  telegramUsername: string;
};

export function ProfileForm({ initial }: { initial: ProfileFormInitial }) {
  const t = useTranslations('EditProfile');
  const [fullName, setFullName] = useState(initial.fullName);
  const [telegram, setTelegram] = useState(initial.telegramUsername);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const input: ProfileInput = { fullName, telegramUsername: telegram };
      const result = await updateProfile(input);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface grid gap-5 rounded-3xl p-6">
      {error ? (
        <p className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {t.has(`errors.${error}`) ? t(`errors.${error}`) : t('errors.unknown')}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {t('saved')}
        </p>
      ) : null}

      <label className="grid gap-1.5">
        <span className={labelClass}>{t('name')}</span>
        <input
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            setSaved(false);
          }}
          required
          minLength={2}
          maxLength={120}
          className={fieldClass}
        />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClass}>{t('phone')}</span>
        <input
          value={initial.phone}
          readOnly
          disabled
          className={`${fieldClass} text-muted-foreground cursor-not-allowed opacity-70`}
        />
        <span className="text-muted-foreground text-xs">{t('phoneLocked')}</span>
      </label>

      <label className="grid gap-1.5">
        <span className={labelClass}>{t('telegram')}</span>
        <input
          value={telegram}
          onChange={(event) => {
            setTelegram(event.target.value);
            setSaved(false);
          }}
          placeholder="@username"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          maxLength={64}
          className={fieldClass}
        />
        <span className="text-muted-foreground text-xs">{t('telegramHint')}</span>
      </label>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground ease-smooth flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium transition-all duration-300 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {pending ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  );
}
