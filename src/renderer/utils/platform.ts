type CreatorPlatformKey = 'onlyfans' | 'fansly' | 'patreon' | 'herohero';

export type CreatorPlatformMeta = {
  key: CreatorPlatformKey;
  name: string;
  baseUrl: string;
  colorScheme: string;
};

const PLATFORM_META: Record<CreatorPlatformKey, CreatorPlatformMeta> = {
  onlyfans: {
    key: 'onlyfans',
    name: 'OnlyFans',
    baseUrl: 'https://onlyfans.com',
    colorScheme: 'blue',
  },
  fansly: {
    key: 'fansly',
    name: 'Fansly',
    baseUrl: 'https://fansly.com',
    colorScheme: 'purple',
  },
  patreon: {
    key: 'patreon',
    name: 'Patreon',
    baseUrl: 'https://www.patreon.com',
    colorScheme: 'orange',
  },
  herohero: {
    key: 'herohero',
    name: 'HeroHero',
    baseUrl: 'https://herohero.co',
    colorScheme: 'teal',
  },
};

const normalizePlatformKey = (platform: string): CreatorPlatformKey | undefined => {
  const normalized = platform.toLowerCase() as CreatorPlatformKey;
  if (normalized in PLATFORM_META) {
    return normalized;
  }
  return undefined;
};

export const getPlatformMeta = (platform: string): CreatorPlatformMeta | undefined => {
  const key = normalizePlatformKey(platform);
  return key ? PLATFORM_META[key] : undefined;
};

export const getPlatformUrl = (platform: string, username?: string): string => {
  const meta = getPlatformMeta(platform);
  const baseUrl = meta?.baseUrl ?? 'https://www.google.com';

  if (meta && username) {
    return `${meta.baseUrl}/${username}`;
  }

  return baseUrl;
};

export const getPlatformColor = (platform: string): string => {
  return getPlatformMeta(platform)?.colorScheme ?? 'gray';
};

export const getCreatorPlatforms = (): CreatorPlatformMeta[] => {
  return Object.values(PLATFORM_META);
};

