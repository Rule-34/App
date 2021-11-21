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
        name: 'Gay blocklist',
        tags: [
          '-gay',
          '-gay_sex',
          '-solo_male',
          '-male_only',
          '-male_focus',
          '-male/male',
          '-male_penetrated',
          '-male_penetrating_male',
        ],
      },
      {
        name: 'Furry blocklist',
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
          '-scales',
          '-accipitrid',
          '-accipitriform',
          '-animal_genitalia',
          '-ferrettre',
          '-rodent',
          '-equine',
        ],
      },
      {
        name: 'Indecencies blocklist',
        tags: ['-scat', '-shitting', '-diaper', '-fart', '-shitpost', '-gore'],
      },
    ],

    savedPosts: [
      // 1st default post
      {
        id: 'rule34.xxx-1',

        data: {
          id: 1,
          score: null,
          high_res_file: {
            url: 'https://safebooru.org/images/1/e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
            width: 1200,
            height: 900,
          },
          low_res_file: {
            url: 'https://safebooru.org/samples/1/sample_e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
            width: 850,
            height: 638,
          },
          preview_file: {
            url: 'https://safebooru.org/thumbnails/1/thumbnail_e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
            width: 150,
            height: 112,
          },
          tags: [
            '1girl',
            'bag',
            'black_hair',
            'blush',
            'bob_cut',
            'bowieknife',
            'breath',
            'coat',
            'girls',
            'gloves',
            'jacket',
            'landscape',
            'miniskirt',
            'mountain',
            'necktie',
            'original',
            'pantyhose',
            'peacoat',
            'purse',
            'scarf',
            'short_hair',
            'skirt',
            'snow',
            'solo',
            'toggles',
            'uniform',
          ],
          source: [],
          rating: 'safe',
          media_type: 'image',
        },

        meta_data: {
          booru_domain: 'rule34.xxx',

          // :')
          created_at: new Date(1997, 8 - 1, 22, '21'),
        },
      },

      // 2nd default post
      {
        id: 'gelbooru.com-5',

        data: {
          id: 5,
          score: 35,
          high_res_file: {
            url: 'https://img3.gelbooru.com/images/b0/b5/b0b53e29fdeb13285591a524f23972d4.gif',
            width: 533,
            height: 800,
          },
          low_res_file: {
            url: 'https://img3.gelbooru.com/images/b0/b5/b0b53e29fdeb13285591a524f23972d4.gif',
            width: 533,
            height: 800,
          },
          preview_file: {
            url: 'https://img3.gelbooru.com/thumbnails/b0/b5/thumbnail_b0b53e29fdeb13285591a524f23972d4.jpg',
            width: 166,
            height: 250,
          },
          tags: [
            '1girl',
            'bare_shoulders',
            'bunny',
            'carrot',
            'contrapposto',
            'disgaea',
            'flat_chest',
            'hair_ribbon',
            'harada_takehito',
            'looking_at_viewer',
            'looking_back',
            'nippon_ichi',
            'original',
            'pleinair',
            'pointy_ears',
            'ribbon',
            'short_hair',
            'simple_background',
            'smile',
            'solo',
            'speech_bubble',
            'standing',
            'sweatdrop',
            'thighhighs',
            'translation_request',
            'usagi-san',
            'white_background',
            'white_legwear',
            'zettai_ryouiki',
          ],
          source: [],
          rating: 'safe',
          media_type: 'image',
        },

        meta_data: {
          booru_domain: 'gelbooru.com',

          // :')
          created_at: new Date(2000, 1 - 1, 31, '0'),
        },
      },
    ],
  },

  settings: {
    touchGestures: {
      name: 'Touch gestures',
      description:
        'Swiping `left-to-right` will open the navigation menu, and `right-to-left` will open the search menu.',
      value: true,
      defaultValue: true,
    },

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

    postsPerPage: {
      name: 'Posts per page',
      description:
        'Number of posts to load per page, hard limit on most boorus is 100.',
      value: 20,
      defaultValue: 20,
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
  getUserSettings(state) {
    return state.settings
  },

  getCustomBoorus(state) {
    return state.custom.boorus
  },

  getTagCollections(state) {
    return state.custom.tagCollections
  },

  getSavedPosts(state) {
    return state.custom.savedPosts
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

  setSavedPosts(state, value) {
    state.custom.savedPosts = Object.freeze(value)
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

  addPostToSavedPosts({ getters, commit }, { post }) {
    const SAVED_POSTS = JSON.parse(JSON.stringify(getters.getSavedPosts))

    const NEW_POST_DATA = post
    NEW_POST_DATA.meta_data.created_at = new Date().toJSON()

    // Add new Post
    SAVED_POSTS.push(NEW_POST_DATA)

    commit('setSavedPosts', SAVED_POSTS)
  },

  removePostFromSavedPosts({ getters, commit }, { postId }) {
    const SAVED_POSTS = JSON.parse(JSON.stringify(getters.getSavedPosts))

    // Remove post with the same ID
    const FILTERED_SAVED_POSTS = SAVED_POSTS.filter((SAVED_POST) => {
      return SAVED_POST.id !== postId
    })

    commit('setSavedPosts', FILTERED_SAVED_POSTS)
  },
}
