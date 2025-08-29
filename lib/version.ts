import packageJson from '@/package.json';

export const appVersion: string = (packageJson as { version: string }).version;
