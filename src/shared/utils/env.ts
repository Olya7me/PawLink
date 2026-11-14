export function getAppEnv(): string {
  return process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
}

export function isDevEnv(): boolean {
  return getAppEnv() !== 'production';
}
