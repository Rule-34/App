<template>
  <div :title="description">
    <!-- If its a boolean -->
    <div v-if="value !== undefined && !Number.isInteger(value)">
      <div class="form-switch inline-block align-middle">
        <!-- When input changes commit reverse value so it toggles between true and false -->
        <input
          :id="switchId"
          v-model="isToggled"
          type="checkbox"
          :name="switchId"
          class="form-switch-checkbox"
          @change="
            changeUserSetting({
              index: switchId,
              value: !value
            })
          "
        />
        <label class="form-switch-label theme-responsive-container" :for="switchId" />
      </div>
      <label class="text-xs text-default" :for="switchId" v-text="text" />
    </div>

    <!-- If its a number -->
    <div v-else>
      <div class="form-switch inline-block align-middle">
        <input
          :id="switchId"
          v-model.number="innerValue"
          type="number"
          :name="switchId"
          class="form-switch-numeric theme-responsive-container"
          @change="
            changeUserSetting({
              index: switchId,
              value: innerValue
            })
          "
        />
      </div>
      <label class="text-xs text-default" :for="switchId" v-text="text" />
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'SettingSwitch',
  // Define all props needed for this component
  props: {
    switchId: { type: String, default: undefined, required: true },
    value: { type: [Boolean, Number], default: undefined, required: false },
    text: { type: String, default: undefined, required: true },
    description: { type: String, default: undefined, required: false },
  },
  // Basic data function to keep track of local values
  data() {
    return {
      isToggled: undefined,
      innerValue: undefined,
    }
  },
  mounted() {
    this.isToggled = this.innerValue = this.value
  },
  // Map mutation for easier use
  methods: {
    ...mapMutations(['changeUserSetting']),
  },
}
</script>

<style lang="postcss">
/* Numeric */
.form-switch-numeric {
  @apply w-full rounded-full shadow-inner text-center leading-normal bg-secondary select-none outline-none;
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
  @apply block overflow-hidden cursor-pointer bg-secondary rounded-full h-6 shadow-inner;

  transition: background-color 0.2s ease-in;
}

/* The ball */
.form-switch-label:before {
  @apply absolute block bg-default inset-y-0 w-6 border border-transparent rounded-full -ml-1;

  right: 50%;
  content: '';
  transition: all 0.2s ease-in;
}
.form-switch-checkbox:checked + .form-switch-label,
.form-switch-checkbox:checked + .form-switch-label:before {
}
.form-switch-checkbox:checked + .form-switch-label {
  @apply bg-primary-hover shadow-none;
}
.form-switch-checkbox:checked + .form-switch-label:before {
  @apply right-0;
}
</style>
