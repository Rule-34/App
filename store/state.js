export default () => ({
  dashBoardData: {
    data: '', // Data that is rendered to the web app
    pid: 0 // Page id
  },
  searchData: {
    data: '', // Data received while searching for tags
    tags: [],
    isActive: false
  },
  generalData: {
    apiUrl: 'https://r34-json.herokuapp.com/', // Default api
    backupApiUrl: 'https://r34-api-clone.herokuapp.com/',
    postLimit: 20,
    errors: null
  }
})
