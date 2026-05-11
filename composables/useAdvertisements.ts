import { default as randomWeightedChoice } from 'random-weighted-choice'

export default function () {
  const popunderScript = useState<string>('popunder-script', () => '')
  const pushScript = useState<string>('push-notification-script', () => '')

  /**
   * Sum of all weights must be 1.0
   */
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
     * Pros: Good min payout (100) | Counts + impressions w/ same traffic? (could be abuse, use of multiple ads that we didnt agree)
     * Cons: Not fixed CPM (~2.0) | Low Revenue (70)
     */
    {
      id: 'https://ellipticaltrack.com/c.D/9v6/bW2/5aleSRW/Qj9SNojrA/zWMxTuk_zvNoiJ0S2kMgDBMux_OXTCMU3Z',
      weight: 0.25
    },
    /**
     * Clickadu
     * Pros: Good CPM (2.1)
     * Cons: Low revenue (50) | Does not count visits well | Clears console
     */
    {
      id: '/js/popunder2.js?v=10',
      weight: 0.25
    },
    /**
     * AdMaven
     * Pros: Good CPM (3.5)
     * Cons: Low Revenue (30) | Impression count lower than everybody else (less overall revenue) | Sometimes replaces current tab instead of opening in new tab | Possible malware: ads open requests to social media login
     */
    {
      id: 'https://dpjf9a2rbjbvp.cloudfront.net/?afjpd=1255038',
      weight: 0.25
    },
    /**
     * AdsCarat
     * Pros: Great CPM (2.5)
     * Cons: Low Revenue (25) | Does not count visits well | Reloads website once?
     */
    // {
    //   id: 'https://hp.scrannyplacebo.com/rMGqiS1acWcIq4LyI/oQRmJ',
    //   weight: 1
    // },
    /**
     * Profiton
     * Pros:
     * Cons:
     */
    {
      id: 'https://je.deuxseethe.com/r1onMblLYR8e/rwnnn',
      weight: 0.25
    }
  ]

  /**
   * Sum of all weights must be 1.0
   */
  const pushAds = [
    /**
     * PartnersHouse
     * Pros: Good min payout (50)
     * Cons: Low revenue (0.4)
     */
    // {
    //   id: 'https://hotbsizovu.today/process.js?id=1300335215&p1=sub1&p2=sub2&p3=sub3&p4=sub4',
    //   weight: 0.3
    // },
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
     * Cons: Low Revenue (0.3 CPM)
     */
    // {
    //   id: '/js/in_page_push_ads.js?v=1',
    //   weight: 0.2
    // },
    /**
     * AdsCarat
     * Pros:
     * Cons: Low revenue (0.50)
     */
    // {
    //   id: '//jn.astelicbanes.com/sgC9H1j3tpX/121206',
    //   weight: 0.15
    // },
    /**
     * EvaDav
     * Pros: Fixed weekly pay (150)
     * Cons: Low revenue
     */
    {
      id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
      weight: 0.4
    },
    /**
     * AdMaven
     * Pros: Good CPM (4.5)
     * Cons: Does not count visits well| Re-opens after closing
     */
    {
      id: 'https://dpjf9a2rbjbvp.cloudfront.net/?afjpd=1255040',
      weight: 0.6
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

export function useChatWithAiReferral() {
  const chatWithAiReferralTemplate = useState<string>('chat-with-ai-referral')

  const chatWithAiReferrals = [
    /**
     * CrushOn
     * Pros:
     * Cons:
     */
    {
      id: 'https://crushon.ai/search?s={query}&ref=zdnmmzy&mist=1',
      weight: 0.3
    },
    /**
     * SpicyChat
     * Pros: More revenue ()
     * Cons:
     */
    {
      id: 'https://spicychat.ai/?public_characters_alias%2Fsort%2Fnum_messages_24h%3Adesc[query]={query}&ref=ode2nzn',
      weight: 0.7
    }
  ]

  if (!chatWithAiReferralTemplate.value) {
    const selectedReferral = randomWeightedChoice(chatWithAiReferrals)
    chatWithAiReferralTemplate.value = selectedReferral
  }

  return {
    chatWithAiReferralTemplate
  }
}
