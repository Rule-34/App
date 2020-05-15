import {
  findBoorusWithValueByKey,
  booruTypeList,
} from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

export default {
  getActiveBooruType: (state) => {
    return findBoorusWithValueByKey(
      state.booruData.active.type,
      'type',
      booruTypeList
    )[0]
  },
}
