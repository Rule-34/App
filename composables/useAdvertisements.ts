import { default as randomWeightedChoice } from 'random-weighted-choice'

export default function () {
  const popunderScript = useState<string>('popunder-script', () => '')
  const pushScript = useState<string>('push-notification-script', () => '')

  const popunderAds = [
    {
      id: '/js/popunder.js?v=7',
      weight: 1,
      provider: 'Adsession'
    },
    // {
    //   id: 'https://messyadvance.com/ckDt9/6Fb.2/5/ltSWWDQe9VNRThUn2/M/D/AH4/MFCG0j1-NrT/YHw/MBDWgHx-',
    //   weight: 1,
    //   provider: 'Hilltopads'
    // }
    {
      id: '/js/popunder2.js?v=1',
      weight: 1,
      provider: 'Clickadu'
    }
  ]

  const pushAds = [
    // {
    //   id: 'https://news-bbipasu.today/process.js?id=1278157271',
    //   weight: 1,
    //   provider: 'PartnersHouse'
    // },
    {
      id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
      weight: 1,
      provider: 'EvaDav'
    },
    // {
    //   id: 'https://imdcn.inppcdn.com/ipp.js?id=fEDzW8oY_k6ti_MQVUi94w',
    //   weight: 1,
    //   provider: 'TacoLoco'
    // }
  ]

  // Load popunder ad if not already loaded
  if (!popunderScript.value) {
    const selectedPopunder = randomWeightedChoice(popunderAds)
    popunderScript.value = selectedPopunder
  }

  // Load push notification ad if not already loaded
  if (!pushScript.value) {
    const selectedPush = randomWeightedChoice(pushAds)
    pushScript.value = selectedPush
  }

  // Common script configuration
  const scriptConfig = {
    async: false,
    defer: true,
    'data-cfasync': 'false',

    // Fix for CORS issues - https://unhead.unjs.io/usage/composables/use-script#referrerpolicy-and-crossorigin
    crossorigin: false
  }

  // Load selected ads
  useScript({
    ...scriptConfig,
    src: popunderScript.value
  })

  useScript({
    ...scriptConfig,
    src: pushScript.value
  })
}
