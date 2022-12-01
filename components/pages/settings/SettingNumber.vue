<template>
  <div>
    <div class='inline-block align-middle'>
      <input
        :id='settingName'
        :value='settingData.value'
        class='focus-visible:focus-util w-16 rounded-full border-2 border-darkGray-100 bg-darkGray-700 px-2 text-gray-200'
        min='0'
        type='number'
        @change='
          setSettingValue({
            setting: settingName,
            value: parseInt($event.target.value, 10)
          })
        '
      />
    </div>

    <label :for='settingName' class='ml-2 text-sm text-gray-300'>
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
        required: true
      }
    },

    methods: {
      ...mapMutations('user', ['setSettingValue'])
    }
  }
</script>
