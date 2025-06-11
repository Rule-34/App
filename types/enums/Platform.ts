export enum Platform {
  GUMROAD = 'Gumroad',
  PATREON = 'Patreon',
  SELLIX = 'Sellix',
  KOFI = 'Ko-Fi',
  SHOP = 'Ghost'
}

export const PLATFORM_URLS = {
  [Platform.GUMROAD]: 'https://app.gumroad.com/library?query=Rule+34+App',
  [Platform.PATREON]: 'https://www.patreon.com/r34app/membership',
  [Platform.SELLIX]: 'https://alejandroakbal.mysellix.io/customer/auth',
  [Platform.KOFI]: 'https://ko-fi.com/account',
  [Platform.SHOP]: 'https://shop.akbal.dev/how-to-get-premium-features/#/portal/account'
} as const

/**
 * Detects the platform based on the license key format
 */
export function detectPlatform(license: string | null): Platform | undefined {
  if (!license) {
    return undefined
  }

  switch (true) {
    case license.startsWith('PATREON-'):
      return Platform.PATREON

    case license.startsWith('SLX-'):
      return Platform.SELLIX

    case license.startsWith('KOFI-'):
      return Platform.KOFI

    case license.startsWith('GHOST-'):
    case license.startsWith('SHOP-'):
      return Platform.SHOP

    case license.length === 35:
      return Platform.GUMROAD

    default:
      return undefined
  }
}
