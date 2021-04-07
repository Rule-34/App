<template>
  <div>
    <div class="inline-block align-middle">
      <input
        :id="settingName"
        :value="settingData.value"
        type="number"
        min="0"
        class="w-16 px-2 text-gray-200 border-2 rounded-full bg-darkGray-700 border-darkGray-100 focus:focus-util"
        @change="
          setSettingValue({
            setting: settingName,
            value: parseInt($event.target.value, 10),
          })
        "
      />
    </div>

    <label :for="settingName" class="ml-2 text-sm text-gray-300">
      {{ settingData.name }}
    </label>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  props: {
    settingName: { type: String, required: true },

    settingData: {
      type: Object,
      required: true,
    },
  },

  methods: {
    ...mapMutations('user', ['setSettingValue']),
  },
}
</script>
