export type PremiumLandingVariation = 'original' | 'OfferFirst' | 'YearlyFocus'

export default function () {
  const premiumLandingVariation = useState<PremiumLandingVariation>('premium-landing-variation', () => 'original')

  return {
    premiumLandingVariation
  }
}
