export default () => ({
  dashBoardData: {
    data: "", // Data that is rendered to the web app
    pid: 0 // Page id
  },
  searchData: {
    data: "", // Data received while searching for tags
    tags: [],
    isActive: false
  },
  generalData: {
    apiUrl: "https://r34-json.herokuapp.com/", // Default api
    backupApiUrl: "https://r34-api-clone.herokuapp.com/",
    postLimit: 20,
    errors: null
  },
  // These settings are saved to localStorage
  userSettings: {
    darkTheme: {
      name: "Dark Theme WIP",
      description: "Enable dark theme app-wide",
      value: false
    },
    fullSizeImages: {
      name: "Full size images",
      description:
        "Load full images instead of downscaled size images, data intensive",
      value: false
    },
    infiniteLoad: {
      name: "Infinite loading WIP",
      description: "Load posts as you scroll down",
      value: false
    },
    hoverControls: {
      name: "Hover Controls",
      description: "Next and last posts will be floating on the bottom",
      value: false
    },

    // TODO: slider for how much zoom
    zoom: {
      name: "Hover Zoom",
      description: "Zoom when you hover posts, useful for videos",
      value: false
    },
    nsfw: {
      name: "NSFW",
      description: "If deactivated all media will be blurred",
      value: true
    }
  }
});
