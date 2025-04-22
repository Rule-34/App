import { default as randomWeightedChoice } from 'random-weighted-choice'

export default function (loadAdScripts: Ref<boolean>) {
  const popunderScript = useState<string>('popunder-script', () => '')
  const pushScript = useState<string>('push-notification-script', () => '')

  const popunderAds = [
    /**
     * Pros:
     * Cons:
     */
    // {
    //   id: '',
    //   weight: 1,
    //   provider: 'ExoClick'
    // },
    /**
     * Pros:
     * Cons:
     */
    // {
    //   id: '/js/popunder.js?v=7',
    //   weight: 1,
    //   provider: 'Adsession'
    // },
    /**
     * Pros:
     * Cons: Not fixed CPM, Low CPM
     */
    {
      id: 'https:////ellipticaltrack.com/c.D/9v6/bW2/5aleSRW/Qj9SNojrA/zWMxTuk_zvNoiJ0S2kMgDBMux_OXTCMU3Z',
      weight: 1,
      provider: 'HilltopAds'
    },
    /**
     * Pros: Good CPM
     * Cons: Does not count visits well
     */
    // {
    //   id: '/js/popunder2.js?v=8',
    //   weight: 1,
    //   provider: 'Clickadu'
    // }
    /**
     * Pros:
     * Cons: Does not open in a new tab, Possible malware: ads open requests to social media login??
     */
    // {
    //   id: 'https://d3pk1qkob3uzgp.cloudfront.net/?kqkpd=1171073',
    //   weight: 1,
    //   provider: 'AdMaven'
    // },
    /**
     * Pros: Great CPM
     * Cons: Does not count visits well | Reloads website once?
     */
    {
      id: 'https://hp.scrannyplacebo.com/rMGqiS1acWcIq4LyI/oQRmJ',
      weight: 1,
      provider: 'AdsCarat'
    }
  ]

  const pushAds = [
    /**
     * Pros:
     * Cons: Very low revenue
     */
    // {
    //   id: 'https://hotbcetici.today/process.js?id=1300335215&p1=sub1&p2=sub2&p3=sub3&p4=sub4',
    //   weight: 0.3,
    //   provider: 'PartnersHouse'
    // },
    /**
     * Pros:
     * Cons:
     */
    {
      id: '\\/\\/ellipticaltrack.com\\/b\\/XeV.sad\\/GJlb0jYvWxcR\\/HewmG9ou\\/ZWUXlukZPMTJY_yMOQTBQe5VMsjVI\\/tuNbjOIh5MNDDpkryvMSwO',
      weight: 0.15,
      provider: 'HilltopAds'
    },
    /**
     * Pros:
     * Cons:
     */
    {
      id: '//guidepaparazzisurface.com/bultykh/ipp24/7/bazinga/2065744',
      weight: 0.15,
      provider: 'Clickadu'
    },
    /**
     * Pros: Fixed weekly pay
     * Cons:
     */
    {
      id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
      weight: 1,
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
