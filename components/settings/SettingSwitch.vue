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
        <label class="form-switch-label" :for="switchId" />
      </div>
      <label class="text-xs text-black" :for="switchId" v-text="text" />
    </div>

    <!-- If its a number -->
    <div v-else>
      <div class="form-switch inline-block align-middle">
        <input
          :id="switchId"
          v-model.number="innerValue"
          type="number"
          :name="switchId"
          class="form-switch-numeric"
          @change="
            changeUserSetting({
              index: switchId,
              value: innerValue
            })
          "
        />
      </div>
      <label class="text-xs text-black" :for="switchId" v-text="text" />
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "SettingSwitch",
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
    };
  },
  mounted() {
    this.isToggled = this.innerValue = this.value;
  },
  // Map mutation for easier use
  methods: {
    ...mapMutations(["changeUserSetting"])
  }
};
</script>

<style lang="postcss">
.form-switch-numeric {
  @apply w-full border rounded-full shadow-inner text-center leading-normal text-gray-600 select-none outline-none;
}
.form-switch {
  @apply relative select-none w-12 mr-2 leading-normal;
}
.form-switch-checkbox {
  @apply hidden;
}
.form-switch-label {
  @apply block overflow-hidden cursor-pointer bg-white border rounded-full h-6 shadow-inner;

  transition: background-color 0.2s ease-in;
}
.form-switch-label:before {
  @apply absolute block bg-white inset-y-0 w-6 border rounded-full -ml-1;

  right: 50%;
  content: "";
  transition: all 0.2s ease-in;
}
.form-switch-checkbox:checked + .form-switch-label,
.form-switch-checkbox:checked + .form-switch-label:before {
}
.form-switch-checkbox:checked + .form-switch-label {
  @apply bg-blue-500 shadow-none;
}
.form-switch-checkbox:checked + .form-switch-label:before {
  @apply right-0;
}
</style>
