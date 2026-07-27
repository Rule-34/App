import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('monetization measurement', () => {
  it('tracks revenue actions without high-volume or acquisition-overwriting signals', () => {
    const promotedContent = source('app/components/pages/posts/PromotedContent.vue')
    const aiReferral = source('app/components/pages/posts/post/PostChatWithAi.vue')
    const premium = source('app/pages/premium/index.vue')
    const premiumOffer = source('app/components/pages/premium/PremiumOfferLanding.vue')
    const experiments = source('app/composables/useExperiments.ts')
    const matomo = source('app/plugins/040.matomo.client.ts')

    expect(source('app/assets/js/promotions.ts')).not.toContain('utm_source=internal')
    expect(promotedContent).toContain("'Promoted Content'")
    expect(promotedContent).not.toContain('sessionStorage')
    expect(promotedContent).not.toContain('vIntersectionObserver')
    expect(promotedContent).not.toContain("'Impression'")
    expect(aiReferral).not.toContain('trackEvent')
    expect(premium).not.toContain("'Checkout Outbound'")
    expect(premium).toContain("['trackEvent', 'Premium', 'Plan Click', interval.key]")
    expect(premiumOffer).toContain("['trackEvent', 'Premium', 'Plan Click', interval.key]")
    expect(premium).toContain('id="pricing"')
    expect(premiumOffer).toContain('checkoutPrice: 59.64')
    expect(premiumOffer).toContain('selectedPaymentInterval.checkoutPrice')
    expect(experiments).not.toContain('sessionStorage')
    expect(experiments).toContain("'original' | 'OfferFirst' | 'YearlyFocus'")
    expect(matomo).toContain("['enableLinkTracking']")
    expect(matomo.match(/\['enableLinkTracking'\]/g)).toHaveLength(1)
    expect(matomo).toContain('onNuxtReady(() =>')
    expect(matomo).toContain('trackPageView(_paq, router.currentRoute.value.fullPath, premiumLandingVariation)')
    expect(matomo).toContain("'AbTesting::create'")
    expect(matomo.indexOf("'AbTesting::create'")).toBeLessThan(matomo.indexOf("['trackPageView']"))
    expect(source('app/components/pages/home/Newsletter.vue')).not.toContain("'Newsletter', 'Submit'")
  })
})
