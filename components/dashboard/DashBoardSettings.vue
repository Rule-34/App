<template>
  <div class="m-5">
    <!-- Domain selector -->
    <div
      class="inline-block relative w-fit-content border rounded-full px-2 shadow"
    >
      <!-- Cloud icon -->
      <div
        for="domain-selector"
        class="absolute inset-y-0 left-0 flex items-center px-2"
      >
        <CloudIcon class="icon text-blue-500 w-4 h-4" />
      </div>

      <!-- Selector -->
      <select
        v-model="selected"
        @change="
          apiManager(selected)
          getPosts()
        "
        class="inline-block appearance-none font-light leading-tight px-4 text-gray-700"
      >
        <option
          v-for="option in options"
          :value="option.value"
          v-text="option.name"
        />
      </select>

      <!-- Drop icon -->
      <div class="absolute inset-y-0 right-0 px-2 items-center flex">
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
      selected: 'xxx/',
      options: [
        { name: 'rule34.paheal.net', value: 'paheal/' },
        { name: 'rule34.xxx', value: 'xxx/' },
      ],
    }
  },

  // Get data() from vuex stores
  computed: {
    ...mapState(['generalData']),
  },

  mounted() {
    this.selected = this.generalData.contentDomain
  },

  methods: {
    ...mapMutations(['apiManager']),
    ...mapActions(['getPosts']),
  },
}
</script>
