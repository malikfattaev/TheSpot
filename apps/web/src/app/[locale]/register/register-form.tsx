'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Home, Loader2, UserRound } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { requestRegisterCode, verifyRegister, type RegisterInput } from './actions';

const roleOptions = [
  { value: 'SEEKER', icon: UserRound, key: 'tenant' },
  { value: 'REALTOR', icon: Building2, key: 'landlord' },
  { value: 'OWNER', icon: Home, key: 'owner' },
] as const;

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

export function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('Register');
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [details, setDetails] = useState<RegisterInput>({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'SEEKER',
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  function submitDetails(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await requestRegisterCode(details);
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
      const result = await verifyRegister(details, code, locale);
      // On success the action redirects; only failures return here.
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="surface animate-fade-up shadow-soft mx-auto grid w-full gap-5 rounded-3xl p-6">
      {error ? (
        <p className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      {step === 'details' ? (
        <form onSubmit={submitDetails} className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-muted-foreground text-sm font-medium">{t('firstName')}</span>
              <input
                autoComplete="given-name"
                required
                minLength={2}
                maxLength={60}
                value={details.firstName}
                onChange={(event) => update('firstName', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-muted-foreground text-sm font-medium">{t('lastName')}</span>
              <input
                autoComplete="family-name"
                required
                minLength={2}
                maxLength={60}
                value={details.lastName}
                onChange={(event) => update('lastName', event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-muted-foreground text-sm font-medium">{t('phone')}</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+998 90 123 45 67"
              required
              value={details.phone}
              onChange={(event) => update('phone', event.target.value)}
              className={inputClass}
            />
          </label>

          <fieldset className="grid gap-3">
            <legend className="text-muted-foreground text-sm font-medium">{t('role')}</legend>
            <div className="grid auto-rows-fr gap-3 sm:grid-cols-3">
              {roleOptions.map(({ value, key, icon: Icon }) => (
                <label key={value} className="group relative h-full cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={details.role === value}
                    onChange={() => update('role', value)}
                    className="peer sr-only"
                  />
                  <span className="border-border bg-background/70 ease-smooth peer-checked:border-foreground/50 peer-checked:bg-card peer-checked:shadow-soft group-hover:border-foreground/30 flex h-full min-h-36 flex-col rounded-2xl border p-4 transition-all duration-300">
                    <Icon className="text-muted-foreground h-5 w-5" aria-hidden />
                    <span className="mt-5 text-sm font-semibold">{t(`roles.${key}.title`)}</span>
                    <span className="text-muted-foreground mt-1 text-xs leading-5">
                      {t(`roles.${key}.description`)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <SubmitButton pending={pending} label={pending ? t('sending') : t('sendCode')} />

          <p className="text-muted-foreground text-center text-sm">
            {t('haveAccountPrompt')}{' '}
            <Link href="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
              {t('loginLink')}
            </Link>
          </p>

          <p className="text-muted-foreground text-center text-xs leading-5">{t('consent')}</p>
        </form>
      ) : (
        <form onSubmit={submitCode} className="grid gap-5">
          <p className="text-muted-foreground text-sm leading-6">
            {t('codeSentTo', { phone: details.phone })}
          </p>

          <label className="grid gap-1.5">
            <span className="text-muted-foreground text-sm font-medium">{t('code')}</span>
            <input
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
              setStep('details');
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
