<template>
  <div
    class="relative flex items-center justify-center gap-2 rounded-full  material-container focus-within:focus-util"
  >
    <!-- Cloud icon -->
    <div for="domain-selector" class="inline-flex items-center pl-2">
      <CloudIcon class="w-4 h-4 icon text-primary-400" />
    </div>

    <!-- Selector -->
    <select
      aria-label="Change the domain where the content is pulled from"
      class="inline-flex items-center font-light outline-none appearance-none  text-primary-400 bg-darkGray-300"
      @change="emitDomainChange"
    >
      <template v-for="domainGroup in domainGroupList">
        <!--  -->

        <optgroup :label="domainGroup.name" :key="domainGroup.name">
          <!--  -->

          <template v-for="domain in domainGroup.domains">
            <!--  -->

            <option
              :key="domain"
              :aria-label="'Change domain to ' + domain"
              :value="domain"
              :selected="activeDomain === domain"
            >
              {{ domain }}
            </option>
          </template>
        </optgroup>
      </template>
    </select>

    <!-- Drop icon -->
    <div for="domain-selector" class="inline-flex items-center pr-2">
      <ChevronDownIcon class="w-4 h-4 icon" />
    </div>
  </div>
</template>

<script>
import { ChevronDownIcon, CloudIcon } from 'vue-feather-icons'

export default {
  components: { ChevronDownIcon, CloudIcon },

  props: {
    activeDomain: {
      type: String,
      required: true,
    },

    domainGroupList: {
      type: Array,
      required: true,
    },
  },

  methods: {
    emitDomainChange(event) {
      const DOMAIN = event.target.value

      this.$emit('domainChange', DOMAIN)
    },
  },
}
</script>
