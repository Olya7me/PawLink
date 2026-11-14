// Global Jest mocks for native modules used by Supabase / Expo.

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest mock factory
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
