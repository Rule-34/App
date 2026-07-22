import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('monetization measurement', () => {
  it('tracks revenue actions without high-volume or acquisition-overwriting signals', () => {
    const promotedContent = source('app/components/pages/posts/PromotedContent.vue')
    const aiReferral = source('app/components/pages/posts/post/PostChatWithAi.vue')
    const premium = source('app/pages/premium/index.vue')
    const matomo = source('app/plugins/040.matomo.client.ts')

    expect(source('app/assets/js/promotions.ts')).not.toContain('utm_source=internal')
    expect(promotedContent).toContain("'Promoted Content'")
    expect(promotedContent).not.toContain('sessionStorage')
    expect(promotedContent).not.toContain('vIntersectionObserver')
    expect(promotedContent).not.toContain("'Impression'")
    expect(aiReferral).not.toContain('trackEvent')
    expect(premium).not.toContain("'Checkout Outbound'")
    expect(matomo).toContain("['enableLinkTracking']")
    expect(matomo.match(/\['enableLinkTracking'\]/g)).toHaveLength(1)
    expect(matomo).toContain('trackPageView(_paq, router.currentRoute.value.fullPath)')
    expect(source('app/components/pages/home/Newsletter.vue')).not.toContain("'Newsletter', 'Submit'")
  })
})
