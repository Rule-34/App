import type { PremiumLandingVariation } from '~/assets/js/matomo'

export type { PremiumLandingVariation }

export default function () {
  const premiumLandingVariation = useState<PremiumLandingVariation>('premium-landing-variation', () => 'original')

  return {
    premiumLandingVariation
  }
}
