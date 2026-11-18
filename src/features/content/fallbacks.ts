import type { AppLanguage } from '@/i18n';
import type { AnimalSpecies, AnimalStatus, HelpType, UrgencyLevel } from '@/shared/types/domain';

export type LookupCategory =
  | 'species'
  | 'urgency'
  | 'help_type'
  | 'feed_sort'
  | 'animal_status'
  | 'report_reason';

export type ReportReasonKey =
  | 'spam'
  | 'inappropriate'
  | 'misleading'
  | 'animal_welfare'
  | 'other';

export type FeedSort = 'newest' | 'oldest' | 'urgency';

export type LookupOption = {
  category: LookupCategory;
  option_key: string;
  label: string;
  sort_order: number;
};

export type AppConfigValues = {
  maxAnimalPhotos: number;
  maxPhotoBytes: number;
  allowedPhotoMimeTypes: string[];
};

export const FALLBACK_SPECIES: AnimalSpecies[] = ['dog', 'cat', 'other'];
export const FALLBACK_URGENCY: UrgencyLevel[] = ['low', 'medium', 'high', 'critical'];
export const FALLBACK_HELP_TYPES: HelpType[] = [
  'catch',
  'transport',
  'vet',
  'foster',
  'permanent_home',
  'food',
  'other',
];
export const FALLBACK_FEED_SORT: FeedSort[] = ['newest', 'oldest', 'urgency'];
export const FALLBACK_ANIMAL_STATUS: AnimalStatus[] = ['active', 'resolved', 'archived'];
export const FALLBACK_REPORT_REASONS: ReportReasonKey[] = [
  'spam',
  'inappropriate',
  'misleading',
  'animal_welfare',
  'other',
];

export const FALLBACK_APP_CONFIG: AppConfigValues = {
  maxAnimalPhotos: 5,
  maxPhotoBytes: 5 * 1024 * 1024,
  allowedPhotoMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

const LABELS: Record<LookupCategory, Record<string, Record<AppLanguage, string>>> = {
  species: {
    dog: { en: 'Dog', ru: 'Собака' },
    cat: { en: 'Cat', ru: 'Кошка' },
    other: { en: 'Other', ru: 'Другое' },
  },
  urgency: {
    low: { en: 'Low', ru: 'Низкая' },
    medium: { en: 'Medium', ru: 'Средняя' },
    high: { en: 'High', ru: 'Высокая' },
    critical: { en: 'Critical', ru: 'Критическая' },
  },
  help_type: {
    catch: { en: 'Catch', ru: 'Отлов' },
    transport: { en: 'Transport', ru: 'Транспорт' },
    vet: { en: 'Vet care', ru: 'Ветпомощь' },
    foster: { en: 'Foster', ru: 'Передержка' },
    permanent_home: { en: 'Permanent home', ru: 'Постоянный дом' },
    food: { en: 'Food', ru: 'Корм' },
    other: { en: 'Other', ru: 'Другое' },
  },
  feed_sort: {
    newest: { en: 'Newest', ru: 'Сначала новые' },
    oldest: { en: 'Oldest', ru: 'Сначала старые' },
    urgency: { en: 'Urgency', ru: 'По срочности' },
  },
  animal_status: {
    active: { en: 'Active', ru: 'Активно' },
    resolved: { en: 'Resolved', ru: 'Решено' },
    archived: { en: 'Archived', ru: 'В архиве' },
  },
  report_reason: {
    spam: { en: 'Spam or advertising', ru: 'Спам или реклама' },
    inappropriate: { en: 'Inappropriate content', ru: 'Неприемлемый контент' },
    misleading: { en: 'Misleading or false', ru: 'Вводит в заблуждение' },
    animal_welfare: { en: 'Animal welfare concern', ru: 'Беспокойство о животном' },
    other: { en: 'Other', ru: 'Другое' },
  },
};

const COPY: Record<string, Record<AppLanguage, string>> = {
  'maps.soonTitle': { en: 'Maps coming soon', ru: 'Карты скоро' },
  'maps.soonBody': {
    en: 'Listings use city as text in this MVP. A map view will land in a later release.',
    ru: 'В этом MVP объявления используют город текстом. Карта появится в следующих версиях.',
  },
  'animals.feed.emptyTitle': { en: 'No listings yet', ru: 'Пока нет объявлений' },
  'animals.feed.emptyBody': {
    en: 'Try clearing filters, or create the first listing from My activity.',
    ru: 'Сбросьте фильтры или создайте первое объявление во вкладке «Моё».',
  },
  'activity.listingsEmptyTitle': { en: 'No publications yet', ru: 'Пока нет объявлений' },
  'activity.listingsEmptyBody': {
    en: 'Create a publication to ask for help with an animal.',
    ru: 'Создайте объявление, чтобы попросить помощь животному.',
  },
  'activity.offersEmptyTitle': { en: 'No offers yet', ru: 'Пока нет откликов' },
  'activity.offersEmptyBody': {
    en: 'Browse the feed and offer help on an open request.',
    ru: 'Откройте ленту и предложите помощь по открытому запросу.',
  },
  'activity.favoritesEmptyTitle': { en: 'No favorites yet', ru: 'Пока нет избранного' },
  'activity.favoritesEmptyBody': {
    en: 'Tap the heart on a listing in the feed to save it here.',
    ru: 'Нажмите сердце на карточке в ленте, чтобы сохранить её здесь.',
  },
  'notifications.emptyTitle': { en: 'No notifications yet', ru: 'Пока нет уведомлений' },
  'notifications.emptyBody': {
    en: 'You will see updates here when someone offers help or a status changes.',
    ru: 'Здесь появятся обновления, когда кто-то предложит помощь или изменится статус.',
  },
  'notifications.offer_created.title': {
    en: 'New offer on your request',
    ru: 'Новый отклик на ваш запрос',
  },
  'notifications.offer_created.body': {
    en: 'Someone offered help on “{{request_title}}”.',
    ru: 'Кто-то предложил помощь по запросу «{{request_title}}».',
  },
  'notifications.offer_accepted.title': {
    en: 'Your offer was accepted',
    ru: 'Ваш отклик приняли',
  },
  'notifications.offer_accepted.body': {
    en: 'You were accepted for “{{request_title}}”. Meetup details are now available.',
    ru: 'Вас приняли на запрос «{{request_title}}». Детали встречи уже доступны.',
  },
  'notifications.offer_rejected.title': {
    en: 'Your offer was not selected',
    ru: 'Ваш отклик не выбран',
  },
  'notifications.offer_rejected.body': {
    en: 'Another helper was chosen for “{{request_title}}”, or the author declined.',
    ru: 'Для запроса «{{request_title}}» выбрали другого помощника или автор отклонил отклик.',
  },
  'notifications.help_request_status.title': {
    en: 'Help request updated',
    ru: 'Статус запроса обновлён',
  },
  'notifications.help_request_status.body': {
    en: '“{{request_title}}” is now {{status}}.',
    ru: 'Запрос «{{request_title}}» теперь: {{status}}.',
  },
  'notifications.animal_status.title': {
    en: 'Listing status changed',
    ru: 'Статус объявления изменён',
  },
  'notifications.animal_status.body': {
    en: '“{{animal_label}}” is now {{status}}.',
    ru: 'Объявление «{{animal_label}}» теперь: {{status}}.',
  },
  'reports.feedback.hint': {
    en: 'Tell us what went wrong — it will help us get better.',
    ru: 'Напишите, что пошло не так — это поможет нам стать лучше.',
  },

  'reports.listing.hint': {
    en: 'Choose a reason and add details if needed. Reports help us keep listings safe.',
    ru: 'Выберите причину и при необходимости добавьте детали. Жалобы помогают держать ленту безопасной.',
  },
};

const KEYS_BY_CATEGORY: Record<LookupCategory, readonly string[]> = {
  species: FALLBACK_SPECIES,
  urgency: FALLBACK_URGENCY,
  help_type: FALLBACK_HELP_TYPES,
  feed_sort: FALLBACK_FEED_SORT,
  animal_status: FALLBACK_ANIMAL_STATUS,
  report_reason: FALLBACK_REPORT_REASONS,
};

export function fallbackLookupOptions(
  locale: AppLanguage,
  category?: LookupCategory,
): LookupOption[] {
  const categories = category ? [category] : (Object.keys(KEYS_BY_CATEGORY) as LookupCategory[]);
  const rows: LookupOption[] = [];
  for (const cat of categories) {
    KEYS_BY_CATEGORY[cat].forEach((key, index) => {
      rows.push({
        category: cat,
        option_key: key,
        label: LABELS[cat][key]?.[locale] ?? key,
        sort_order: (index + 1) * 10,
      });
    });
  }
  return rows;
}

export function fallbackLookupLabel(
  category: LookupCategory,
  key: string,
  locale: AppLanguage,
): string {
  return LABELS[category]?.[key]?.[locale] ?? key;
}

export function fallbackAppCopy(key: string, locale: AppLanguage): string {
  return COPY[key]?.[locale] ?? key;
}

export function fallbackAppCopyMap(locale: AppLanguage): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of Object.keys(COPY)) {
    const value = COPY[key]?.[locale];
    if (value) {
      map[key] = value;
    }
  }
  return map;
}
