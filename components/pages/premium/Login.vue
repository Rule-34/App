<template>
  <div class="material-container text-default-text p-4">
    <form
      :action="gumroad.authAPI.url"
      :method="gumroad.authAPI.fetchOptions.method"
      @submit="checkForm"
    >
      <label
        class="block text-lg font-medium leading-tight mb-2"
        for="license-key"
      >
        License Key
      </label>

      <div class="w-full flex items-center mt-1">
        <input
          id="license-key"
          class="appearance-none outline-none block flex-grow w-10/12 font-light bg-background border border-border rounded-md p-2 shadow-sm text-sm"
          placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
          type="text"
          name="license-key"
          required
          @input="setLicenseKey($event.target.value)"
        />

        <!-- Action -->
        <button
          type="submit"
          class="appearance-none bg-gradient-blue-lilac border-0 rounded-full ml-1 shadow-md"
        >
          <chevron-right-icon class="icon text-default w-9 h-9" />
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { ChevronRightIcon } from 'vue-feather-icons'

export default {
  name: 'Login',

  components: {
    ChevronRightIcon,
  },

  computed: {
    ...mapState('premium', ['gumroad']),
  },

  methods: {
    ...mapActions('premium', ['authenticate']),
    ...mapMutations('premium', ['setRawResponse', 'setLicenseKey']),

    async checkForm(event) {
      event.preventDefault()

      await this.authenticate()
    },
  },
}
</script>
