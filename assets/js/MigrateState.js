'use strict'

/**
 * Migrate the state to new versions
 * @param {Object} state
 * @returns {Object} migrated state
 */
export function migrateState(state) {
  const STATE_VERSION = state.version

  switch (STATE_VERSION) {
    case 0:
      state = migrateVersion0State(state)
      break

    default:
      console.debug(
        `No migration necessary for state version "${STATE_VERSION}"`
      )
      return state
  }

  // Recursively migrate the state
  return migrateState(state)
}

/**
 * @param {Object} state
 * @returns {Object}
 */
function migrateVersion0State(state) {
  const posts = state.user.custom.savedPosts

  posts.map((post) => {
    // Change tags structure from array to object
    const POST_TAGS = post.data.tags

    post.data.tags = {
      character: [],
      copyright: [],
      artist: [],
      general: POST_TAGS,
      meta: [],
    }

    // Rename "source" to "sources"
    post.data.sources = post.data.source

    delete post.data.source

    return post
  })

  // Update the state version
  state.version = 1

  return state
}
