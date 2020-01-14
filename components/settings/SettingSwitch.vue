<template>
  <div :title="description">
    <!-- If its a boolean -->
    <div v-if="value !== undefined && !Number.isInteger(value)">
      <div class="form-switch inline-block align-middle">
        <!-- When input changes commit reverse value so it toggles between true and false -->
        <input
          :id="switchId"
          v-model="isToggled"
          :name="switchId"
          @change="
            changeUserSetting({
              index: switchId,
              value: !value
            })
          "
          type="checkbox"
          class="form-switch-checkbox"
        />
        <label
          :for="switchId"
          class="form-switch-label theme-responsive-container"
        />
      </div>
      <label :for="switchId" v-text="text" class="text-xs text-default-text" />
    </div>

    <!-- If its a number -->
    <div v-else>
      <div class="form-switch inline-block align-middle">
        <input
          :id="switchId"
          v-model.number="innerValue"
          :name="switchId"
          @change="
            changeUserSetting({
              index: switchId,
              value: innerValue
            })
          "
          type="number"
          min="0"
          inputmode="numeric"
          pattern="[0-9]*"
          class="form-switch-numeric theme-responsive-container"
        />
      </div>
      <label :for="switchId" v-text="text" class="text-xs text-default-text" />
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
    description: { type: String, default: undefined, required: false }
  },
  // Basic data function to keep track of local values
  data() {
    return {
      isToggled: undefined,
      innerValue: undefined
    }
  },
  mounted() {
    this.isToggled = this.innerValue = this.value
  },
  // Map mutation for easier use
  methods: {
    ...mapMutations(['changeUserSetting'])
  }
}
</script>

<style lang="postcss">
/* Numeric */
.form-switch-numeric {
  @apply w-full rounded-full shadow-inner text-center leading-normal bg-background select-none outline-none;
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
