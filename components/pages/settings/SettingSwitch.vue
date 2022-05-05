<template>
  <div class="flex items-center">
    <!-- Enabled: "bg-indigo-600", Not Enabled: "bg-gray-200" -->
    <button
      type="button"
      class="relative inline-flex shrink-0 w-16 h-6 transition-colors duration-200 border-2 rounded-full cursor-pointer border-darkGray-100 focus:focus-util"
      :class="[settingData.value ? 'bg-primary-500' : 'bg-darkGray-700']"
      :aria-pressed="settingData.value"
      :aria-labelledby="settingName"
      @click="
        setSettingValue({
          setting: settingName,
          value: !settingData.value,
        })
      "
    >
      <span class="sr-only">Use setting</span>

      <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
      <span
        aria-hidden="true"
        class="inline-block w-5 h-5 transition duration-200 transform bg-white rounded-full shadow pointer-events-none ring-0"
        :class="[settingData.value ? 'translate-x-10' : 'translate-x-0']"
      ></span>
    </button>

    <span :id="settingName" class="ml-3">
      <span class="text-sm text-gray-300">
        {{ settingData.name }}
      </span>
    </span>
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
