<template>
  <div class="relative flex m-0 rounded-full material-container">
    <!-- Cloud icon -->
    <div for="domain-selector" class="inline-flex items-center pl-2 pr-1">
      <CloudIcon class="w-4 h-4 icon text-primary" />
    </div>

    <!-- Selector -->
    <select
      :value="getActiveBooru.domain"
      aria-label="Change the domain where the content is pulled from"
      class="inline-flex items-center font-light outline-none appearance-none text-primary bg-elevation"
      @change="changeDomain($event.target.value)"
    >
      <optgroup label="Default">
        <option
          v-for="booru in getDefaultBooruList"
          :key="booru.domain"
          :aria-label="'Change domain to ' + booru.domain"
          :value="booru.domain"
          :selected="getActiveBooru.domain === booru.domain"
        >
          {{ booru.domain }}
        </option>
      </optgroup>

      <optgroup label="Custom">
        <template v-if="isUserPremium">
          <option
            v-for="booru in getPremiumBooruList"
            :key="booru.domain"
            :aria-label="'Change domain to ' + booru.domain"
            :value="booru.domain"
            :selected="getActiveBooru.domain === booru.domain"
          >
            {{ booru.domain }}
          </option>
        </template>

        <option value="Add booru">&lt;Add Booru&gt;</option>
      </optgroup>
    </select>

    <!-- Drop icon -->
    <div class="inline-flex items-center pl-1 pr-2">
      <ChevronDownIcon class="w-4 h-4 icon text-default" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

// Third party
import { ChevronDownIcon, CloudIcon } from 'vue-feather-icons'

export default {
  name: 'DomainSelector',

  components: { ChevronDownIcon, CloudIcon },

  computed: {
    ...mapGetters('booru', [
      'getActiveBooru',
      'getDefaultBooruList',
      'getPremiumBooruList',
    ]),
    ...mapGetters('premium', ['isUserPremium']),
  },

  methods: {
    ...mapActions('booru', ['activeBooruManager']),

    async changeDomain(domain) {
      if (domain === 'Add booru') {
        await this.$router.push({ name: 'premium' })
        return
      }

      await this.activeBooruManager({ operation: 'set', value: domain })
    },
  },
}
</script>
