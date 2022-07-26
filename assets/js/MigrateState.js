'use strict'

/**
 * Migrate the state to new versions
 * @param {Object} state
 * @returns {Object} migrated state
 */
export function migrateState(state) {
  const INITIAL_STATE_VERSION = state.version

  switch (INITIAL_STATE_VERSION) {
    case 0:
      state = migrateVersion0State(state)
      break

    default:
      console.debug(
        `No migration necessary for state version "${INITIAL_STATE_VERSION}"`
      )
      return state
  }

  console.debug(`Migrated state to version "${state.version}"`)

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
    const POST_TAGS = post.data.tags

    // Convert array to object
    if (Array.isArray(POST_TAGS)) {
      post.data.tags = {
        character: [],
        copyright: [],
        artist: [],
        general: POST_TAGS,
        meta: []
      }
    }

    // Rename "source" to "sources"
    if ('source' in post.data) {
      post.data.sources = post.data.source

      delete post.data.source
    }

    return post
  })

  // Update the state version
  state.version = 1

  return state
}
