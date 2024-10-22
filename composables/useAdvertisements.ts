import { default as random_weighted_choice } from 'random-weighted-choice'

export default function () {
  const adScript = useState<string>('adScript', () => '')

  const weightedAds = [
    // HilltopAds
    {
      id: 'https://messyadvance.com/ckDt9/6Fb.2/5/ltSWWDQe9VNRThUn2/M/D/AH4/MFCG0j1-NrT/YHw/MBDWgHx-',
      weight: 10
    },
    // Galaksion
    {
      id: 'https://dt.shilyricracs.com/rPFulNmxlj7ZNGc/kmlaO',
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

  console.log(adScript.value)
}
