import { default as randomWeightedChoice } from 'random-weighted-choice'

export default function () {
  const popunderScript = useState<string>('popunder-script', () => '')
  const pushScript = useState<string>('push-notification-script', () => '')

  const popunderAds = [
    /**
     * ExoClick
     * Pros:
     * Cons:
     */
    // {
    //   id: '',
    //   weight: 1,
    // },
    /**
     * Adsession
     * Pros:
     * Cons:
     */
    // {
    //   id: '/js/popunder.js?v=7',
    //   weight: 1,
    // },
    /**
     * HilltopAds
     * Pros: Good min payout
     * Cons: Not fixed CPM, Low Revenue (70)
     */
    {
      id: 'https:////ellipticaltrack.com/c.D/9v6/bW2/5aleSRW/Qj9SNojrA/zWMxTuk_zvNoiJ0S2kMgDBMux_OXTCMU3Z',
      weight: 1
    },
    /**
     * Clickadu
     * Pros: Good CPM (2.1)
     * Cons: Low revenue (70), Does not count visits well, (!!!) Clears console
     */
    {
      id: '/js/popunder2.js?v=8',
      weight: 1
    }
    /**
     * AdMaven
     * Pros:
     * Cons: Does not open in a new tab, Possible malware: ads open requests to social media login??
     */
    // {
    //   id: 'https://d3pk1qkob3uzgp.cloudfront.net/?kqkpd=1171073',
    //   weight: 1,
    // },
    /**
     * AdsCarat
     * Pros: Great CPM (2.5)
     * Cons: Low Revenue (25) | Does not count visits well | Reloads website once?
     */
    // {
    //   id: 'https://hp.scrannyplacebo.com/rMGqiS1acWcIq4LyI/oQRmJ',
    //   weight: 1
    // }
  ]

  const pushAds = [
    /**
     * PartnersHouse
     * Pros:
     * Cons: Low revenue (17)
     */
    {
      id: 'https://hotbsizovu.today/process.js?id=1300335215&p1=sub1&p2=sub2&p3=sub3&p4=sub4',
      weight: 0.15
    },
    /**
     * HilltopAds
     * Pros:
     * Cons: Very Low Revenue (1.96)
     */
    // {
    //   id: '\\/\\/ellipticaltrack.com\\/b\\/XeV.sad\\/GJlb0jYvWxcR\\/HewmG9ou\\/ZWUXlukZPMTJY_yMOQTBQe5VMsjVI\\/tuNbjOIh5MNDDpkryvMSwO',
    //   weight: 0.15,
    // },
    /**
     * Clickadu
     * Pros:
     * Cons: Low Revenue (4.64)
     */
    // {
    //   id: '//guidepaparazzisurface.com/bultykh/ipp24/7/bazinga/2065744',
    //   weight: 0.15,
    // },
    /**
     * AdsCarat
     * Pros:
     * Cons: Extremely low revenue (0.50)
     */
    // {
    //   id: '//jn.astelicbanes.com/sgC9H1j3tpX/121206',
    //   weight: 0.15
    // },
    /**
     * EvaDav
     * Pros: Fixed weekly pay ()
     * Cons:
     */
    {
      id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
      weight: 1
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

  // Load selected ads
  useHead({
    script: [
      {
        src: popunderScript.value,
        async: false,
        defer: true,

        // Fix for CORS issues - https://unhead.unjs.io/usage/composables/use-script#referrerpolicy-and-crossorigin
        crossorigin: 'anonymous'
      },
      {
        src: pushScript.value,
        async: false,
        defer: true,

        crossorigin: 'anonymous'
      }
    ]
  })
}
