import { project } from '@/config/project'

export const premiumPromotions = [
  // Premium
  {
    media: '/img/promo/premium/No Ads.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-no-ads'
  },
  {
    media: '/img/promo/premium/Faster Image Loading.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-faster-image-loading'
  },
  {
    media: '/img/promo/premium/Save Posts.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-save-posts'
  },
  {
    media: '/img/promo/premium/History.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-history'
  },
  {
    media: '/img/promo/premium/Additional Boorus.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-additional-boorus'
  },
  {
    media: '/img/promo/premium/One-Click Downloads.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-one-click-downloads'
  },
  {
    media: '/img/promo/premium/Tag Collections.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-tag-collections'
  },
  {
    media: '/img/promo/premium/Source Finder.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-source-finder'
  },
  {
    media: '/img/promo/premium/Discord Role.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-discord-role'
  },
  {
    media: '/img/promo/premium/Support Us.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=internal&utm_medium=promo-support-us'
  }
]

export const otherPromotions = [
  // HentaiPorn
  {
    media: '/img/promo/HentaiPorn.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: `https://hentaiporn.app/?utm_source=${project.urls.production.hostname}&utm_medium=promotion`
  }
]

export const referralPromotions = [
  // candy.ai
  {
    media: '/img/promo/referrals/AI-Girlfriend-300x600.jpg',
    mediaWidth: 300,
    mediaHeight: 600,
    mediaType: 'image',
    link: 'https://candy.ai?via=rule-3496'
  },
  {
    media: '/img/promo/referrals/AI-sexting-1200x1200.jpg',
    mediaWidth: 1200,
    mediaHeight: 1200,
    mediaType: 'image',
    link: 'https://candy.ai?via=rule-3496'
  }
]

export const advertisementPromotions = [
  /**
   * ExoClick
   * Pros:
   * Cons: Low revenue (5)
   */
  // Mobile Banner
  {
    media: '//a.magsrv.com/iframe.php?idzone=5386082&size=300x250',
    mediaWidth: 300,
    mediaHeight: 250,
    mediaType: 'iframe',
    link: null
  },
  // Banner
  {
    media: '//a.magsrv.com/iframe.php?idzone=5386192&size=300x500',
    mediaWidth: 300,
    mediaHeight: 500,
    mediaType: 'iframe',
    link: null
  },
  // Banner Vertical
  {
    media: '//a.magsrv.com/iframe.php?idzone=5386194&size=160x600',
    mediaWidth: 160,
    mediaHeight: 600,
    mediaType: 'iframe',
    link: null
  }

  /**
   * JuicyAds
   */
  // Banner
  // {
  //   media: '//adserver.juicyads.com/adshow.php?adzone=1064535',
  //   mediaWidth: 300,
  //   mediaHeight: 250,
  //   mediaType: 'iframe',
  //   link: null
  // },
  // Banner Skyscraper
  // {
  //   media: '//adserver.juicyads.com/adshow.php?adzone=1064588',
  //   mediaWidth: 160,
  //   mediaHeight: 600,
  //   mediaType: 'iframe',
  //   link: null
  // },
  // Banner
  // {
  //   media: '//adserver.juicyads.com/adshow.php?adzone=1064589',
  //   mediaWidth: 250,
  //   mediaHeight: 250,
  //   mediaType: 'iframe',
  //   link: null
  // },

  /**
   * Clickadu
   */
  // Banner
  // {
  //   media: '//brittlesturdyunlovable.com/lvesnk.html?zoneid=2034752',
  //   mediaWidth: 300,
  //   mediaHeight: 100,
  //   mediaType: 'iframe',
  //   link: null
  // },
  // Banner
  // {
  //   media: '//brittlesturdyunlovable.com/lvesnk.html?zoneid=2034751',
  //   mediaWidth: 300,
  //   mediaHeight: 250,
  //   mediaType: 'iframe',
  //   link: null
  // }

  /**
   * Traffic Stars
   */
  // Banner
  // {
  //   media: '//tsyndicate.com/iframes2/9f1ad3ea132b475dbc63f38aa049b5fb.html',
  //   mediaWidth: 300,
  //   mediaHeight: 250,
  //   mediaType: 'iframe',
  //   link: null
  // },
  // // Banner
  // {
  //   media: '//tsyndicate.com/iframes2/b7c3325ce7c94ec1905bfe0dd553163e.html',
  //   mediaWidth: 315,
  //   mediaHeight: 300,
  //   mediaType: 'iframe',
  //   link: null
  // }
]
