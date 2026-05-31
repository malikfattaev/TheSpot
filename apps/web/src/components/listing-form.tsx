'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { createListing, updateListing, type ListingInput } from '@/app/[locale]/listings/actions';
import { mediaSrc } from '@/lib/media';
import {
  CURRENCY_OPTIONS,
  DISTRICT_KEYS,
  RENT_PERIOD_OPTIONS,
  ROOM_OPTIONS,
} from '@/lib/listing-options';
import { cn } from '@/lib/utils';

const PROPERTY_TYPES = ['APARTMENT', 'ROOM', 'HOUSE', 'STUDIO', 'COMMERCIAL'] as const;
const CURRENCIES = CURRENCY_OPTIONS;
const MAX_IMAGES = 12;

const fieldClass =
  'border-border bg-background focus:border-foreground/30 h-12 w-full rounded-2xl border px-4 text-sm outline-none transition-colors';
const labelClass = 'text-muted-foreground text-sm font-medium';

export type ListingFormInitial = {
  title: string;
  description: string;
  type: (typeof PROPERTY_TYPES)[number];
  rooms: string;
  areaSqm: string;
  floor: string;
  city: string;
  district: string;
  address: string;
  price: string;
  currency: (typeof CURRENCIES)[number];
  rentPeriod: (typeof RENT_PERIOD_OPTIONS)[number];
  publish: boolean;
  imageUrls: string[];
};

const EMPTY_INITIAL: ListingFormInitial = {
  title: '',
  description: '',
  type: 'APARTMENT',
  rooms: '1',
  areaSqm: '',
  floor: '',
  city: 'Ташкент',
  district: '',
  address: '',
  price: '',
  currency: 'UZS',
  rentPeriod: 'MONTHLY',
  publish: true,
  imageUrls: [],
};

type ListingFormProps = {
  locale: string;
  mode: 'create' | 'edit';
  listingId?: string;
  initial?: ListingFormInitial;
};

type Photo =
  | { kind: 'existing'; url: string }
  | { kind: 'new'; file: File; preview: string };

export function ListingForm({ locale, mode, listingId, initial }: ListingFormProps) {
  const t = useTranslations('ListingForm');
  const tDistricts = useTranslations('Districts');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const start = initial ?? EMPTY_INITIAL;
  const [values, setValues] = useState<Omit<ListingFormInitial, 'imageUrls'>>({
    title: start.title,
    description: start.description,
    type: start.type,
    rooms: start.rooms,
    areaSqm: start.areaSqm,
    floor: start.floor,
    city: start.city,
    district: start.district,
    address: start.address,
    price: start.price,
    currency: start.currency,
    rentPeriod: start.rentPeriod,
    publish: start.publish,
  });
  const [photos, setPhotos] = useState<Photo[]>(
    start.imageUrls.map((url) => ({ kind: 'existing', url })),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    // Only create object URLs for the files that actually fit — creating them
    // for the overflow and then slicing it off would leak those blob URLs.
    const remaining = MAX_IMAGES - photos.length;
    if (remaining <= 0) return;
    const incoming = Array.from(fileList)
      .slice(0, remaining)
      .map((file): Photo => ({ kind: 'new', file, preview: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...incoming]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.kind === 'new') URL.revokeObjectURL(removed.preview);
      return next;
    });
  }

  async function uploadNewPhotos(): Promise<string[]> {
    const newPhotos = photos.filter((photo): photo is Extract<Photo, { kind: 'new' }> =>
      photo.kind === 'new',
    );
    if (newPhotos.length === 0) return [];

    const body = new FormData();
    for (const photo of newPhotos) body.append('files', photo.file);

    const response = await fetch('/api/upload', { method: 'POST', body });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? 'uploadFailed');
    }
    const data = (await response.json()) as { urls: string[] };
    return data.urls;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      let uploadedUrls: string[] = [];
      try {
        setUploading(true);
        uploadedUrls = await uploadNewPhotos();
      } catch (uploadError) {
        setUploading(false);
        setError(uploadError instanceof Error ? uploadError.message : 'uploadFailed');
        return;
      }
      setUploading(false);

      // Preserve order: kept existing photos, then the freshly uploaded ones.
      let nextUploaded = 0;
      const imageUrls = photos
        .map((photo) =>
          photo.kind === 'existing' ? photo.url : uploadedUrls[nextUploaded++],
        )
        .filter((url): url is string => Boolean(url));

      const input: ListingInput = { ...values, imageUrls };
      const result =
        mode === 'edit' && listingId
          ? await updateListing(listingId, input, locale)
          : await createListing(input, locale);

      // On success the action redirects; only failures return here.
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const busy = pending || uploading;
  const submitLabel = uploading
    ? t('uploading')
    : pending
      ? t('saving')
      : mode === 'edit'
        ? t('save')
        : t('publish');

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {error ? (
        <p className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {t.has(`errors.${error}`) ? t(`errors.${error}`) : t('errors.unknown')}
        </p>
      ) : null}

      {/* Photos */}
      <div className="surface rounded-3xl p-6">
        <h2 className="font-semibold">{t('photos')}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t('photosHint')}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.kind === 'existing' ? photo.url : photo.preview}
              className="group border-border relative aspect-[4/3] overflow-hidden rounded-2xl border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.kind === 'existing' ? mediaSrc(photo.url) : photo.preview}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                aria-label={t('removePhoto')}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}

          {photos.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed transition-colors"
            >
              <ImagePlus className="h-6 w-6" aria-hidden />
              <span className="text-xs">{t('addPhoto')}</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {/* Main details */}
      <div className="surface grid gap-5 rounded-3xl p-6">
        <label className="grid gap-1.5">
          <span className={labelClass}>{t('title')}</span>
          <input
            value={values.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder={t('titlePlaceholder')}
            required
            className={fieldClass}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={labelClass}>{t('description')}</span>
          <textarea
            value={values.description}
            onChange={(event) => set('description', event.target.value)}
            placeholder={t('descriptionPlaceholder')}
            required
            rows={5}
            className={cn(fieldClass, 'h-auto resize-y py-3 leading-relaxed')}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelClass}>{t('type')}</span>
            <select
              value={values.type}
              onChange={(event) => set('type', event.target.value as typeof values.type)}
              className={cn(fieldClass, 'appearance-none')}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className={labelClass}>{t('rooms')}</span>
            <select
              value={values.rooms}
              onChange={(event) => set('rooms', event.target.value)}
              required
              className={cn(fieldClass, 'appearance-none')}
            >
              {ROOM_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className={labelClass}>{t('area')}</span>
            <input
              value={values.areaSqm}
              onChange={(event) => set('areaSqm', event.target.value)}
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="45"
              className={cn(fieldClass, 'no-spinner')}
            />
          </label>

          <label className="grid gap-1.5">
            <span className={labelClass}>{t('floor')}</span>
            <input
              value={values.floor}
              onChange={(event) => set('floor', event.target.value)}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="3"
              className={cn(fieldClass, 'no-spinner')}
            />
          </label>
        </div>
      </div>

      {/* Location */}
      <div className="surface grid gap-5 rounded-3xl p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelClass}>{t('city')}</span>
            <input
              value={values.city}
              onChange={(event) => set('city', event.target.value)}
              required
              className={fieldClass}
            />
          </label>

          <label className="grid gap-1.5">
            <span className={labelClass}>{t('district')}</span>
            <select
              value={values.district}
              onChange={(event) => set('district', event.target.value)}
              className={cn(fieldClass, 'appearance-none')}
            >
              <option value="">{t('districtPlaceholder')}</option>
              {DISTRICT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {tDistricts(key)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={labelClass}>{t('address')}</span>
          <input
            value={values.address}
            onChange={(event) => set('address', event.target.value)}
            placeholder={t('addressPlaceholder')}
            className={fieldClass}
          />
        </label>
      </div>

      {/* Price */}
      <div className="surface grid gap-5 rounded-3xl p-6 sm:grid-cols-[1fr_auto_auto]">
        <label className="grid gap-1.5">
          <span className={labelClass}>{t('price')}</span>
          <input
            value={values.price}
            onChange={(event) => set('price', event.target.value)}
            type="number"
            inputMode="numeric"
            min={0}
            required
            placeholder="5000000"
            className={cn(fieldClass, 'no-spinner')}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={labelClass}>{t('currency')}</span>
          <select
            value={values.currency}
            onChange={(event) => set('currency', event.target.value as typeof values.currency)}
            className={cn(fieldClass, 'appearance-none sm:w-28')}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className={labelClass}>{t('rentPeriod')}</span>
          <select
            value={values.rentPeriod}
            onChange={(event) => set('rentPeriod', event.target.value as typeof values.rentPeriod)}
            className={cn(fieldClass, 'appearance-none sm:w-40')}
          >
            {RENT_PERIOD_OPTIONS.map((period) => (
              <option key={period} value={period}>
                {t(`rentPeriods.${period}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-3 px-1">
        <input
          type="checkbox"
          checked={values.publish}
          onChange={(event) => set('publish', event.target.checked)}
          className="border-border text-primary focus:ring-ring h-5 w-5 rounded-md"
        />
        <span className="text-sm">
          {t('publishNow')}
          <span className="text-muted-foreground block text-xs">{t('publishHint')}</span>
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="bg-primary text-primary-foreground ease-smooth flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium transition-all duration-300 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground h-12 px-4 text-sm transition-colors"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
