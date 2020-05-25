import {
  findBoorusWithValueByKey,
  booruTypeList,
} from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

export default {
  getActiveBooru: (state) => {
    // Preparing to change this logic and improve it
    return state.booruData.active
  },

  getActiveBooruType: (state) => {
    return findBoorusWithValueByKey(
      state.booruData.active.type,
      'type',
      booruTypeList
    )[0]
  },
}
