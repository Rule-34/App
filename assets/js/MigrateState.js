'use strict'

/**
 * Migrate the state to new versions
 * @param {Object} state
 * @returns {Object} migrated state
 */
export function migrateState(state) {
  const INITIAL_STATE_VERSION = state.version

  if (INITIAL_STATE_VERSION == null) {
    throw new Error('Invalid initial state version')
  }

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

export function createStateFromStore(store) {
  return {
    version: store.getters['getVersion'],

    user: {
      custom: {
        boorus: store.getters['user/getCustomBoorus'],
        tagCollections: store.getters['user/getCustomTagCollections'],
        savedPosts: store.getters['user/getCustomSavedPosts']
      }
    }
  }
}

export function restoreStateToStore(state, store) {
  if (!state.version) {
    throw new Error('Invalid state')
  }

  // TODO: Think about what happens when an old state version is restored
  store.commit('setVersion', state.version)

  if (state.user.custom.boorus) {
    store.commit('user/setCustomBoorus', state.user.custom.boorus)
  }

  if (state.user.custom.tagCollections) {
    store.commit(
      'user/setCustomTagCollections',
      state.user.custom.tagCollections
    )
  }

  if (state.user.custom.savedPosts) {
    store.commit('user/setCustomSavedPosts', state.user.custom.savedPosts)
  }
}
