<template>
  <div class="m-5">
    <!-- Domain selector -->
    <div
      class="inline-flex w-fit-content relative border rounded-full shadow bg-white overflow-hidden"
    >
      <!-- Cloud icon -->
      <div for="domain-selector" class="inline-flex items-center pl-2">
        <CloudIcon class="icon text-blue-500 w-4 h-4" />
      </div>

      <!-- Selector -->
      <select
        :value="selected"
        @change="
          apiManager($event.target.value)
          getPosts()
        "
        class="inline-flex items-center appearance-none outline-none font-light text-gray-700 bg-white"
      >
        <option
          v-for="option in options"
          :value="option.value"
          v-text="option.name"
        />
      </select>

      <!-- Drop icon -->
      <div class="inline-flex items-center pr-2">
        <ChevronDownIcon class="icon text-gray-700 w-4 h-4" />
      </div>
    </div>

    <!-- Anything else -->
    <!--  -->
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { ChevronDownIcon, CloudIcon } from 'vue-feather-icons'

export default {
  name: 'DashBoardSettings',
  components: { ChevronDownIcon, CloudIcon },

  data() {
    return {
      options: [
        { name: 'rule34.paheal.net', value: 'paheal/' },
        { name: 'rule34.xxx', value: 'xxx/' },
      ],
    }
  },

  // Get data() from vuex stores
  computed: {
    ...mapState(['dashBoardSettings']),
    selected() {
      return this.dashBoardSettings.contentDomain
    },
  },

  methods: {
    ...mapMutations(['apiManager']),
    ...mapActions(['getPosts']),
  },
}
</script>
