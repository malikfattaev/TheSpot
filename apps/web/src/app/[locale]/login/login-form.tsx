'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { requestLoginCode, verifyLogin } from './actions';

const inputClass =
  'border-border bg-background focus:border-foreground/30 h-12 rounded-2xl border px-4 text-sm outline-none transition-colors';

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground ease-smooth flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-300 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {label}
    </button>
  );
}

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('Login');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitPhone(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await requestLoginCode(phone);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setStep('code');
      }
    });
  }

  function submitCode(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await verifyLogin(phone, code, locale);
      // On success the action redirects; only failures return here.
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="surface animate-fade-up shadow-soft mx-auto grid w-full max-w-md gap-5 rounded-3xl p-6">
      {error ? (
        <p className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      {step === 'phone' ? (
        <form onSubmit={submitPhone} className="grid gap-5">
          <label className="grid gap-1.5">
            <span className="text-muted-foreground text-sm font-medium">{t('phone')}</span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+998 90 123 45 67"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
            />
          </label>

          <SubmitButton pending={pending} label={pending ? t('sending') : t('sendCode')} />

          <p className="text-muted-foreground text-center text-sm">
            {t('noAccountPrompt')}{' '}
            <Link href="/register" className="text-foreground font-medium underline-offset-4 hover:underline">
              {t('registerLink')}
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitCode} className="grid gap-5">
          <p className="text-muted-foreground text-sm leading-6">{t('codeSentTo', { phone })}</p>

          <label className="grid gap-1.5">
            <span className="text-muted-foreground text-sm font-medium">{t('code')}</span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="0000"
              required
              maxLength={4}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className={`${inputClass} text-center text-lg tracking-[0.5em]`}
            />
          </label>

          <SubmitButton pending={pending} label={pending ? t('verifying') : t('verify')} />

          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setCode('');
              setError(null);
            }}
            className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
          >
            {t('changePhone')}
          </button>

          <p className="text-muted-foreground/70 text-center text-xs">{t('devHint')}</p>
        </form>
      )}
    </div>
  );
}
