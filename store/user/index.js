export const state = () => ({
  custom: {
    boorus: [],

    // filters: [],
  },

  // saved: { posts: [] },

  settings: {
    darkTheme: {
      name: 'Dark theme',
      description: 'Enable dark theme app-wide.',
      value: true,
      defaultValue: true,
    },

    keyboardControls: {
      name: 'Keyboard controls',
      description:
        "Keyboard's right and left arrows will navigate pages like clicking the control's buttons.",
      image: '/img/usage_examples/keyboard-controls',
      value: false,
      defaultValue: false,
    },

    hoverControls: {
      name: 'Hover controls',
      description:
        'Controls will hover over content and be fixed on the screen.',
      image: '/img/usage_examples/hover-controls',
      value: false,
      defaultValue: false,
    },

    videoControls: {
      name: 'Video controls',
      description:
        "Videos will have controls, but clicking it won't show tags.",
      image: '/img/usage_examples/video-controls',
      value: true,
      defaultValue: true,
    },

    lazyLoading: {
      name: 'Lazy load',
      description:
        'Load media when it enters view, so you only use data when you see it.',
      value: true,
      defaultValue: true,
    },

    fullSizeImages: {
      name: 'Full size images',
      description:
        'Load full images instead of downscaled size images, data intensive.',
      image: '/img/usage_examples/full-size-images',
      value: false,
      defaultValue: false,
    },

    infiniteLoad: {
      name: 'Infinite loading',
      description:
        'Load posts infinitely instead of using Controls, VERY resource heavy.',
      value: false,
      defaultValue: false,
    },

    postsPerPage: {
      name: 'Posts per page',
      description: 'Number of posts to load per page, hard limit is 100.',
      value: 20,
      defaultValue: 20,
    },

    score: {
      name: 'Minimum score',
      description: 'Sets the required score for a post to show.',
      value: 0,
      defaultValue: 0,
    },

    imgRetry: {
      name: 'Image retry',
      description:
        'Number of times that an image will be attempted to be loaded if it fails.',
      value: 1,
      defaultValue: 1,
    },

    animations: {
      name: 'Animations',
      description: 'Use animations and other resource-heavy resources.',
      value: true,
      defaultValue: true,
    },

    nsfw: {
      name: 'NSFW',
      description: 'Allows NSFW content to be shown.',
      value: true,
      defaultValue: true,
    },
  },
})

export const mutations = {
  setSettingValue(state, { setting, value }) {
    state.settings[setting].value = value
  },

  setCustomBoorus(state, value) {
    state.custom.boorus = value
  },

  pushCustomBooruValue(state, value) {
    state.custom.boorus.push(value)
  },
}

export const actions = {
  customBoorusManager({ state, commit }, { operation, value }) {
    switch (operation) {
      case 'add': {
        const doesTheBooruAlreadyExist = state.custom.boorus.some(
          (booruObj) => booruObj.domain === value.domain
        )

        if (doesTheBooruAlreadyExist) {
          console.debug('A booru with this domain already exists!')
          return
        }

        commit('pushCustomBooruValue', value)
        break
      }

      case 'remove': {
        const arrayWithoutBooru = state.custom.boorus.filter((customBooru) => {
          return customBooru.domain !== value.domain
        })

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
}
