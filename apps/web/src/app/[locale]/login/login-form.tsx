'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Home, Loader2, UserRound } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { enterWithPhone } from './actions';

const roleOptions = [
  { value: 'SEEKER', icon: UserRound, key: 'tenant' },
  { value: 'REALTOR', icon: Building2, key: 'landlord' },
  { value: 'OWNER', icon: Home, key: 'owner' },
] as const;

function SubmitButton() {
  const t = useTranslations('Login');
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground ease-smooth flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-300 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {pending ? t('submitting') : t('submit')}
    </button>
  );
}

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('Login');
  const [state, formAction] = useActionState(enterWithPhone, {});

  return (
    <form
      action={formAction}
      className="surface animate-fade-up shadow-soft grid gap-5 rounded-3xl p-6"
    >
      <input type="hidden" name="locale" value={locale} />

      {state.error ? (
        <p className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-muted-foreground text-sm font-medium">{t('firstName')}</span>
          <input
            name="firstName"
            autoComplete="given-name"
            required
            minLength={2}
            maxLength={60}
            className="border-border bg-background focus:border-foreground/30 h-12 rounded-2xl border px-4 text-sm outline-none transition-colors"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-muted-foreground text-sm font-medium">{t('lastName')}</span>
          <input
            name="lastName"
            autoComplete="family-name"
            required
            minLength={2}
            maxLength={60}
            className="border-border bg-background focus:border-foreground/30 h-12 rounded-2xl border px-4 text-sm outline-none transition-colors"
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-muted-foreground text-sm font-medium">{t('phone')}</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          required
          className="border-border bg-background focus:border-foreground/30 h-12 rounded-2xl border px-4 text-sm outline-none transition-colors"
        />
      </label>

      <fieldset className="grid gap-3">
        <legend className="text-muted-foreground text-sm font-medium">{t('role')}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {roleOptions.map(({ value, key, icon: Icon }) => (
            <label key={value} className="group relative cursor-pointer">
              <input
                type="radio"
                name="role"
                value={value}
                required
                defaultChecked={value === 'SEEKER'}
                className="peer sr-only"
              />
              <span className="border-border bg-background/70 ease-smooth peer-checked:border-foreground/50 peer-checked:bg-card peer-checked:shadow-soft group-hover:border-foreground/30 flex min-h-28 flex-col justify-between rounded-2xl border p-4 transition-all duration-300">
                <Icon
                  className="text-muted-foreground peer-checked:text-foreground h-5 w-5"
                  aria-hidden
                />
                <span className="mt-4 text-sm font-semibold">{t(`roles.${key}.title`)}</span>
                <span className="text-muted-foreground mt-1 text-xs leading-5">
                  {t(`roles.${key}.description`)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <SubmitButton />

      <p className="text-muted-foreground text-center text-xs leading-5">{t('consent')}</p>
    </form>
  );
}
