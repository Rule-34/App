export const state = () => ({
  custom: {
    boorus: [
      {
        domain: 'xbooru.com',
        type: 'gelbooru',
        nsfw: true,
        config: null,
      },
    ],

    tagCollections: [
      {
        name: 'Furry',
        tags: [
          '-furry',
          '-furry_only',
          '-fur',
          '-canid',
          '-canine',
          '-dragon',
          '-anthro',
          '-anthrofied',
          '-anthro_on_anthro',
          '-scaly',
          '-accipitrid',
          '-accipitriform',
          '-animal_genitalia',
          '-ferrettre',
          '-rodent',
          '-equine',
        ],
      },
      {
        name: 'Common Indecencies',
        tags: ['-scat', '-diaper', '-shitpost', '-gore'],
      },
    ],
  },

  // saved: { posts: [] },

  settings: {
    hoverControls: {
      name: 'Hover controls',
      description: 'Page controls will be fixed over the content.',
      image: '/img/usage_examples/hover-controls',
      value: false,
      defaultValue: false,
    },

    fullSizeImages: {
      name: 'Full size images',
      description:
        'Load full images instead of downscaled images, data intensive.',
      image: '/img/usage_examples/full-size-images',
      value: false,
      defaultValue: false,
    },

    infiniteLoad: {
      name: 'Infinite loading',
      description: 'Load posts infinitely instead of using the page controls.',
      value: false,
      defaultValue: false,
    },

    score: {
      name: 'Minimum score',
      description: 'Required score for a post to show.',
      value: 0,
      defaultValue: 0,
    },

    imgRetry: {
      name: 'Image retry',
      description: 'Number of attempts to load an image.',
      value: 1,
      defaultValue: 1,
    },
  },
})

export const getters = {
  getCustomBoorus(state) {
    return state.custom.boorus
  },

  getTagCollections(state) {
    return state.custom.tagCollections
  },

  getUserSettings(state) {
    return state.settings
  },
}

export const mutations = {
  setSettingValue(state, { setting, value }) {
    state.settings[setting].value = value
  },

  setCustomBoorus(state, value) {
    state.custom.boorus = Object.freeze(value)
  },

  setCustomTagCollections(state, value) {
    state.custom.tagCollections = Object.freeze(value)
  },
}

export const actions = {
  customBoorusManager({ getters, commit }, { operation, value }) {
    switch (operation) {
      case 'add': {
        const doesTheBooruAlreadyExist = getters.getCustomBoorus.some(
          (booruObj) => booruObj.domain === value.domain
        )

        if (doesTheBooruAlreadyExist) {
          console.debug('A booru with this domain already exists!')
          return
        }

        const arrayWithAddedBooru = [...getters.getCustomBoorus, value]

        commit('setCustomBoorus', arrayWithAddedBooru)
        break
      }

      case 'remove': {
        const arrayWithoutBooru = getters.getCustomBoorus.filter(
          (customBooru) => {
            return customBooru.domain !== value.domain
          }
        )

        commit('setCustomBoorus', arrayWithoutBooru)
        break
      }

      case 'reset':
        commit('setCustomBoorus', [])
        break

      default:
        throw new Error('No operation specified')
    }
  },

  customTagCollectionsManager({ getters, commit }, { operation, value }) {
    switch (operation) {
      case 'add': {
        const doesTheTagCollectionAlreadyExist = getters.getTagCollections.some(
          (tagCollection) => tagCollection.name === value.name
        )

        if (doesTheTagCollectionAlreadyExist) {
          console.debug('A tag collection with this name already exists!')
          return
        }

        const arrayWithTagCollection = [...getters.getTagCollections, value]

        commit('setCustomTagCollections', arrayWithTagCollection)
        break
      }

      case 'remove': {
        const arrayWithoutTagCollection = getters.getTagCollections.filter(
          (tagCollection) => {
            return tagCollection.name !== value.name
          }
        )

        commit('setCustomTagCollections', arrayWithoutTagCollection)
        break
      }

      case 'reset':
        commit('setCustomTagCollections', [])
        break

      default:
        throw new Error('No operation specified')
    }
  },
}
