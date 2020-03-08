export default () => ({
  dashBoardData: {
    data: [], // Data that is rendered to the web app
    pid: 0 // Page id
  },

  // These settings are saved to localStorage
  dashBoardSettings: {
    contentDomain: 'xxx',
    experimentalSettings: false
  },

  sideNavData: {
    isActive: false
  },

  searchData: {
    data: [], // Data received while searching for tags
    tags: [], // Tags that are added for searching posts with that tags
    premadeFilterData: [], // Data received from Gist
    isActive: false, // Is search bar active
    isFilterActive: false
  },

  generalData: {
    // apiUrl: 'http://localhost:8000/',
    apiUrl: 'https://rule-34-api.herokuapp.com/',
    // corsProxyUrl: 'https://test-proxy.rule34app.workers.dev/',
    corsProxyUrl: 'https://cors-proxy.rule34app.workers.dev/',
    errors: null
  },

  // These settings are saved to localStorage
  notificationData: {
    latestTitle: '',
    data: [] // Data fetched from Gist
  },

  // These settings are saved to localStorage
  userSettings: {
    darkTheme: {
      name: 'Dark theme',
      description: 'Enable dark theme app-wide.',
      value: true,
      defaultValue: true
    },

    keyboardControls: {
      name: 'Keyboard controls',
      description:
        "Keyboard's right and left arrows will navigate pages like clicking the control's buttons.",
      image: '/img/examples/keyboard-controls',
      value: false,
      defaultValue: false
    },

    hoverControls: {
      name: 'Hover controls',
      description:
        'Controls will hover over content and be fixed on the screen.',
      image: '/img/examples/hover-controls',
      value: false,
      defaultValue: false
    },

    videoControls: {
      name: 'Video controls',
      description:
        "Videos will have controls, but clicking it won't show tags.",
      image: '/img/examples/video-controls',
      value: true,
      defaultValue: true
    },

    // TODO: slider for how much zoom
    zoom: {
      name: 'Hover Zoom',
      description:
        'Zoom posts when you hover over them, not really useful, but quite amusing.',
      image: '/img/examples/hover-zoom',
      value: false,
      defaultValue: false
    },

    lazyLoading: {
      name: 'Lazy load',
      description:
        'Load media when it enters view, so you only use data when you see it.',
      value: true,
      defaultValue: true
    },

    fullSizeImages: {
      name: 'Full size images',
      description:
        'Load full images instead of downscaled size images, data intensive.',
      image: '/img/examples/full-size-images',
      value: false,
      defaultValue: false
    },

    infiniteLoad: {
      name: 'Infinite loading',
      description:
        'Load posts infinitely instead of using Controls, VERY resource heavy.',
      value: false,
      defaultValue: false
    },

    postsPerPage: {
      name: 'Posts per page',
      description: 'Number of posts to load per page, hard limit is 100.',
      value: 20,
      defaultValue: 20
    },

    score: {
      name: 'Minimum score',
      description: 'Sets the required score for a post to show.',
      value: 0,
      defaultValue: 0
    },

    imgRetry: {
      name: 'Image retry',
      description:
        'Number of times that an image will be attempted to be loaded if it fails.',
      value: 3,
      defaultValue: 3
    },

    disableAnimations: {
      name: 'Disable animations',
      description:
        'If active, animations and other resource-heavy resources will be removed.',
      value: false,
      defaultValue: false
    },

    nsfw: {
      name: 'NSFW',
      description: 'If deactivated all media will be blurred.',
      image: '/img/examples/nsfw',
      value: true,
      defaultValue: true
    }
  }
})
