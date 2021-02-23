<template>
  <div class="p-4 material-container text-default-text">
    <form @submit.prevent="userLogin">
      <label
        class="block mb-2 text-lg font-medium leading-tight"
        for="license-key"
      >
        License Key
      </label>

      <div class="flex items-center w-full mt-1">
        <input
          id="license-key"
          v-model="login.password"
          class="flex-grow block w-10/12 p-2 text-sm font-light border rounded-md shadow-sm outline-none appearance-none bg-background border-border"
          placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
          type="text"
          name="license-key"
          required
        />

        <!-- Action -->
        <button
          type="submit"
          class="ml-1 border-0 rounded-full shadow-md appearance-none bg-gradient-blue-lilac"
        >
          <chevron-right-icon class="icon text-default w-9 h-9" />
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { ChevronRightIcon } from 'vue-feather-icons'

export default {
  components: {
    ChevronRightIcon,
  },

  data() {
    return {
      login: {
        password: '',
      },
    }
  },

  methods: {
    ...mapActions('premium', ['authenticate']),

    async userLogin() {
      await this.authenticate(this.login)
    },
  },
}
</script>
