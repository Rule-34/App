<template>
  <div class="flex items-center">
    <!-- Enabled: "bg-indigo-600", Not Enabled: "bg-gray-200" -->
    <button
      type="button"
      class="focus:focus-util relative inline-flex h-6 w-16 shrink-0 cursor-pointer rounded-full border-2 border-darkGray-100 transition-colors duration-200"
      :class="[settingData.value ? 'bg-primary-500' : 'bg-darkGray-700']"
      :aria-pressed="settingData.value"
      :aria-labelledby="settingName"
      @click="
        setSettingValue({
          setting: settingName,
          value: !settingData.value
        })
      "
    >
      <span class="sr-only">Use setting</span>

      <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
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
      required: true
    }
  },

  methods: {
    ...mapMutations('user', ['setSettingValue'])
  }
}
</script>
