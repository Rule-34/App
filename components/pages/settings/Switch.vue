<template>
  <div :title="setting.description">
    <!-- If its a number -->
    <div v-if="setting && Number.isInteger(setting.defaultValue)">
      <div class="inline-block align-middle form-switch">
        <input
          :id="settingIndex"
          :name="setting.name"
          :value="setting.value"
          type="number"
          min="0"
          max="100"
          class="form-switch-numeric color-util border-util"
          @change="
            setSettingValue({
              setting: settingIndex,
              value: parseInt($event.target.value, 10),
            })
          "
        />
      </div>
      <label
        :for="settingIndex"
        class="text-xs text-default-text"
        v-text="setting.name"
      />
    </div>

    <!-- If its a boolean -->
    <div v-else>
      <div class="inline-block align-middle form-switch">
        <input
          :id="settingIndex"
          :name="setting.name"
          :checked="setting.value"
          type="checkbox"
          class="form-switch-checkbox"
          @change="
            setSettingValue({
              setting: settingIndex,
              value: $event.target.checked,
            })
          "
        />
        <label
          :for="settingIndex"
          class="form-switch-label color-util border-util"
        />
      </div>
      <label
        :for="settingIndex"
        class="text-xs text-default-text"
        v-text="setting.name"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'SettingSwitch',

  props: {
    settingIndex: { type: String, default: undefined, required: true }, // The string selector of the object of objects
    setting: {
      type: Object,
      default() {
        return undefined
      },
      required: true,
    },
  },

  methods: {
    ...mapMutations('user', ['setSettingValue']),
  },
}
</script>

<style lang="postcss">
/* Numeric */
.form-switch-numeric {
  @apply w-full rounded-full shadow-inner text-center leading-normal bg-background select-text outline-none;
}

/* The container */
.form-switch {
  @apply relative select-none w-12 mr-2 leading-normal;
}
.form-switch-checkbox {
  @apply hidden;
}

/* Label that acts as the checkbox */
.form-switch-label {
  @apply block overflow-hidden cursor-pointer bg-background rounded-full h-6 shadow-inner;
  transition: background-color 0.2s ease-in;
}

/* The ball */
.form-switch-label:before {
  @apply absolute block bg-background inset-y-0 w-6 border border-border rounded-full -ml-1;

  right: 50%;
  content: '';
  transition: all 0.2s ease-in;
}
.form-switch-checkbox:checked + .form-switch-label {
  @apply bg-primary-hover shadow-none;
}
.form-switch-checkbox:checked + .form-switch-label:before {
  @apply right-0;
}
</style>
