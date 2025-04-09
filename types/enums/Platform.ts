export enum Platform {
  SELLIX = 'Sellix',
  PATREON = 'Patreon',
  KOFI = 'Ko-Fi',
  GUMROAD = 'Gumroad',
}

export const PLATFORM_URLS = {
  [Platform.SELLIX]: 'https://alejandroakbal.mysellix.io/customer/auth',
  [Platform.PATREON]: 'https://www.patreon.com/r34app/membership',
  [Platform.GUMROAD]: 'https://app.gumroad.com/library?query=Rule+34+App',
  [Platform.KOFI]: 'https://ko-fi.com/alejandro_akbal/tiers',
} as const

/**
 * Detects the platform based on the license key format
 */
export function detectPlatform(license: string | null): Platform | undefined {
  if (!license) {
    return undefined
  }

  switch (true) {
    case license.startsWith('SLX-'):
      return Platform.SELLIX

    case license.startsWith('PATREON-'):
      return Platform.PATREON

    case license.startsWith('KOFI-'):
      return Platform.KOFI

    case license.length === 35:
      return Platform.GUMROAD

    default:
      return undefined
  }
}
