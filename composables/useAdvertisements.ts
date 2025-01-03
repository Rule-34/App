import { default as random_weighted_choice } from 'random-weighted-choice'

export default function () {
  const adScript = useState<string>('adScript', () => '')

  const weightedAds = [
    // Adsession - Popunder
    {
      id: '/js/popunder.js?v=7',
      weight: 1
    },

    // Hilltopads - Popunder
    // {
    //   id: 'https://messyadvance.com/ckDt9/6Fb.2/5/ltSWWDQe9VNRThUn2/M/D/AH4/MFCG0j1-NrT/YHw/MBDWgHx-',
    //   weight: 1
    // }
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

  // PartnersHouse - InPage Push
  // useScript({
  //   src: 'https://news-bbipasu.today/process.js?id=1278157271',
  //   async: false,
  //   defer: true,
  //   'data-cfasync': 'false'
  // })

  // EvaDav - InPage Push
  useScript({
    src: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
    async: false,
    defer: true,
    'data-cfasync': 'false'
  })
}
