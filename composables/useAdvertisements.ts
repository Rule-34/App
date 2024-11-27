import { default as random_weighted_choice } from 'random-weighted-choice'

export default function () {
  const adScript = useState<string>('adScript', () => '')

  const weightedAds = [
    // Adsession
    {
      id: '/js/popunder.js?v=3',
      weight: 1
    }
  ]

  if (!adScript.value) {
    const selectedAd = random_weighted_choice(weightedAds)

    adScript.value = selectedAd
  }

  useScript({
    src: adScript.value,
    async: false,
    defer: true,
    'data-cfasync': 'false'
  })
}
