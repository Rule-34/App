export default () => ({
  dashBoardData: {
    data: [], // Data that is rendered to the web app
    pid: 0, // Page id
  },

  searchData: {
    data: [], // Data received while searching for tags
    tags: [], // Tags that are added for searching posts with that tags
    premadeFilterData: [],
    isActive: false, // Is search bar active
    isFilterActive: false,
  },

  sideNavData: {
    isActive: false,
  },

  generalData: {
    apiUrl: 'https://r34-app-original-api.herokuapp.com/',
    postLimit: 20,
    errors: null,
  },

  // These settings are saved to localStorage
  dashBoardSettings: {
    contentDomain: 'xxx/',
    experimentalSettings: false,
  },

  // These settings are saved to localStorage
  userSettings: {
    darkTheme: {
      name: 'Dark Theme',
      description: 'Enable dark theme app-wide',
      value: true,
    },
    lazyLoading: {
      name: 'Lazy Load Media',
      description:
        'Load media when it enters view, so you only use data when you see it',
      value: true,
    },
    infiniteLoad: {
      name: 'Infinite Loading',
      description: 'Load posts as you scroll down',
      value: false,
    },
    score: {
      name: 'Minimum Score',
      description: 'Only show posts that have the indicated score or more',
      value: 0,
    },
    fullSizeImages: {
      name: 'Full Size Images',
      description:
        'Load full images instead of downscaled size images, data intensive',
      value: false,
    },
    videoControls: {
      name: 'Video Controls',
      description: 'Enable usage of video controls',
      value: true,
    },
    hoverControls: {
      name: 'Hover Controls',
      description: 'Next and last posts will be floating on the bottom',
      value: false,
    },
    // TODO: slider for how much zoom
    zoom: {
      name: 'Hover Zoom',
      description: 'Zoom when you hover posts, useful for videos',
      value: false,
    },
    keyboardControls: {
      name: 'Keyboard Controls',
      description: "Control next and last page with keyboard's arrows",
      value: true,
    },
    nsfw: {
      name: 'NSFW',
      description: 'If deactivated all media will be blurred',
      value: true,
    },
  },
})
