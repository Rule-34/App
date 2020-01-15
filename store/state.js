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
    premadeFilterData: [],
    isActive: false, // Is search bar active
    isFilterActive: false
  },

  generalData: {
    // apiUrl: 'http://localhost:8000/',
    apiUrl: 'https://r34-app-original-api.herokuapp.com/',
    postLimit: 20,
    errors: null
  },

  // These settings are saved to localStorage
  userSettings: {
    darkTheme: {
      name: 'Dark Theme',
      description: 'Enable dark theme app-wide',
      value: true,
      defaultValue: true
    },

    keyboardControls: {
      name: 'Keyboard Controls',
      description: "Control next and last page with keyboard's arrows",
      value: true,
      defaultValue: true
    },

    hoverControls: {
      name: 'Hover Controls',
      description: 'Next and last posts will be floating on the bottom',
      value: false,
      defaultValue: false
    },

    videoControls: {
      name: 'Video Controls',
      description: 'Enable usage of video controls',
      value: true,
      defaultValue: true
    },

    // TODO: slider for how much zoom
    zoom: {
      name: 'Hover Zoom',
      description: 'Zoom when you hover posts, useful for videos',
      value: false,
      defaultValue: false
    },

    lazyLoading: {
      name: 'Lazy Load Media',
      description:
        'Load media when it enters view, so you only use data when you see it',
      value: true,
      defaultValue: true
    },

    fullSizeImages: {
      name: 'Full Size Images',
      description:
        'Load full images instead of downscaled size images, data intensive',
      value: false,
      defaultValue: false
    },

    infiniteLoad: {
      name: 'Infinite Loading',
      description: 'Load posts as you scroll down',
      value: false,
      defaultValue: false
    },

    imgRetry: {
      name: 'Image retry',
      description:
        'Number of times that an image will be attempted to be loaded',
      value: 3,
      defaultValue: 3
    },

    score: {
      name: 'Minimum Score',
      description: 'Only show posts that have the indicated score or more',
      value: 0,
      defaultValue: 0
    },

    nsfw: {
      name: 'NSFW',
      description: 'If deactivated all media will be blurred',
      value: true,
      defaultValue: true
    }
  }
})
