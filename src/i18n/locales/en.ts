export const en = {
  app: {
    name: 'PawLink',
    tagline: 'Coordinate help for animals in need',
  },
  common: {
    loading: 'Loading…',
    error: 'Something went wrong',
    empty: 'Nothing here yet',
    retry: 'Try again',
    cancel: 'Cancel',
    save: 'Save',
    continue: 'Continue',
  },
  shell: {
    title: 'PawLink',
    subtitle: 'Foundation ready. Product screens come after architecture review.',
  },
};

export type TranslationResources = {
  [K in keyof typeof en]: {
    [P in keyof (typeof en)[K]]: string;
  };
};
