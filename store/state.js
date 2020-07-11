import { booruList } from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

export default () => ({
  dashBoardData: {
    data: [], // Data that is rendered to the web app
    pid: undefined,
  },

  // These settings are saved to localStorage
  booruData: {
    active: booruList[0],

    boorus: booruList,
  },

  searchData: {
    data: [], // Data received while searching for tags
    tags: [], // Tags that are added for searching posts with that tags

    isFilterActive: false,
    premadeFilterData: [], // Data received from Gist
  },

  generalData: {
    apiUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8100/'
        : 'https://api.r34.app/',

    CORSProxyURL: 'https://cors-proxy.r34.app/',

    error: undefined,
  },
})
