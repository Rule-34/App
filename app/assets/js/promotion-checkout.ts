/**
 * Checkout link helpers for promotional campaigns.
 *
 * Ghost Portal offer links use the hash route `#/portal/offers/<offerId>`; the
 * offer itself encodes the tier and cadence. Keep the base URL here so the
 * format can change in one place.
 */
export const GHOST_PORTAL_SIGNUP_URL = 'https://www.refinedsoft.com/'

export function ghostOfferUrl(offerId: string): string {
  return `${GHOST_PORTAL_SIGNUP_URL}#/portal/offers/${offerId}`
}

/**
 * SellApp reads an initial coupon from the `coupon` query parameter on product
 * URLs (verified on the live product page). Existing params such as
 * `payment_method=XMR` are preserved.
 */
export function withSellAppCoupon(url: string, coupon: string | null): string {
  if (!coupon) return url

  const parsed = new URL(url)
  parsed.searchParams.set('coupon', coupon)

  return parsed.toString()
}

type MatomoWindow = Window & { _paq?: { push: (event: unknown[]) => void } }

export function trackPromotionCheckout(
  promotionId: string,
  cadence: 'monthly' | 'yearly' | 'lifetime' | '30days'
): void {
  if (typeof window === 'undefined') return

  ;(window as MatomoWindow)._paq?.push(['trackEvent', 'Promotion', 'Offer Click', `${promotionId}:${cadence}`])
}
