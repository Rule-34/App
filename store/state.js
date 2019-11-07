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
      name: "Dark Theme",
      description: "Enable dark theme app-wide",
      value: false
    },
    hoverControls: {
      name: "Hover Controls",
      description: "Next and last posts will be floating on the bottom",
      value: false
    },
    nsfw: {
      name: "NSFW",
      description: "If deactivated all media will be blurred",
      value: true
    },
    fullSizeImages: {
      name: "Full size images",
      description:
        "Load full images instead of downscaled size images, data intensive",
      value: true
    }
  }
});
