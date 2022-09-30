'use strict'

import { cloneDeep } from 'lodash-es'

export function createStateFromStore(store) {
  const STATE = {
    version: store.getters['getVersion'],

    user: {
      custom: {
        boorus: store.getters['user/getCustomBoorus'],
        tagCollections: store.getters['user/getCustomTagCollections'],
        savedPosts: store.getters['user/getCustomSavedPosts']
      }
    }
  }

  return cloneDeep(STATE)
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
