export function createAPIURL(mode, state, parameters = {}) {
  const domainData = state.booruData.active

  const queryObj = {
    posts: {
      limit: state.userSettings.postsPerPage.value,
      pid: state.dashBoardData.pid,
      tags: state.searchData.tags.join('+'),
      score: state.userSettings.score.value,
    },

    singlePost: {
      id: parameters.postID,
    },

    tags: { tag: parameters.tag },
  }

  let URL = state.generalData.apiUrl

  switch (mode) {
    case 'posts':
      URL += `booru/${domainData.type}/${mode}?domain=${domainData.domain}`

      URL += '&limit=' + queryObj.posts.limit

      URL += '&pid=' + queryObj.posts.pid

      URL += '&tags=' + queryObj.posts.tags

      URL += '&score=>=' + queryObj.posts.score
      break

    case 'single-post':
      URL += `booru/${domainData.type}/${mode}?domain=${domainData.domain}`

      URL += '&id=' + queryObj.singlePost.id
      break

    case 'tags':
      URL += `booru/${domainData.type}/${mode}?domain=${domainData.domain}`

      // URL += '&limit=' + queryObj.limit

      URL += '&tag=' + queryObj.tags.tag
      break

    default:
      throw new Error('No mode specified')
  }

  if (domainData.config) {
    URL += '&config=' + encodeURIComponent(JSON.stringify(domainData.config))
  }

  return URL
}
