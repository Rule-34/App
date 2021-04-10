<template>
  <div class="p-4 material-container">
    <form @submit.prevent="userLogin">
      <label
        class="block mb-2 text-lg font-medium leading-tight text-white"
        for="license-key"
      >
        License Key
      </label>

      <div class="flex flex-row items-center w-full gap-1 mt-1">
        <input
          id="license-key"
          v-model="login.password"
          class="flex-grow block w-10/12 p-2 text-sm font-light text-gray-300 outline-none appearance-none focus:focus-util material-container bg-darkGray-700 border-darkGray-100"
          placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
          type="text"
          name="license-key"
          required
        />

        <!-- Action -->
        <button
          type="submit"
          class="ml-1 border-0 rounded-full appearance-none bg-gradient-to-br from-primary-400 to-accent-400 focus:focus-util"
        >
          <chevron-right-icon class="icon w-9 h-9" />
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
