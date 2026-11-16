export const FAQ_ITEM_IDS = [
  'guestBrowse',
  'createListing',
  'offerHelp',
  'acceptOffer',
  'cityOnly',
  'privacy',
] as const;

export type FaqItemId = (typeof FAQ_ITEM_IDS)[number];
