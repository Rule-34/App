import { default as randomWeightedChoice } from 'random-weighted-choice'

export default function (loadAdScripts: Ref<boolean>) {
  const popunderScript = useState<string>('popunder-script', () => '')
  const pushScript = useState<string>('push-notification-script', () => '')

  const popunderAds = [
    // {
    //   id: '/js/popunder.js?v=7',
    //   weight: 1,
    //   provider: 'Adsession'
    // },
    {
      id: 'https:////ellipticaltrack.com/c.D/9v6/bW2/5aleSRW/Qj9SNojrA/zWMxTuk_zvNoiJ0S2kMgDBMux_OXTCMU3Z',
      weight: 1,
      provider: 'Hilltopads'
    },
    {
      id: '/js/popunder2.js?v=1',
      weight: 1,
      provider: 'Clickadu'
    }
  ]

  const pushAds = [
    {
      id: 'https://hotbcetici.today/process.js?id=1300335215&p1=sub1&p2=sub2&p3=sub3&p4=sub4',
      weight: 0.3,
      provider: 'PartnersHouse'
    },
    {
      id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
      weight: 0.7,
      provider: 'EvaDav'
    }
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
  useScript(
    {
      ...scriptConfig,
      src: popunderScript.value
    },
    {
      trigger: loadAdScripts
    }
  )

  useScript(
    {
      ...scriptConfig,
      src: pushScript.value
    },
    {
      trigger: loadAdScripts
    }
  )
}
