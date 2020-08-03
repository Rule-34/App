<template>
  <main class="flex flex-col justify-around h-screen mt-4 space-y-4">
    <div>
      <!-- Booru list -->
      <div class="px-2 py-1 overflow-x-scroll material-container">
        <table class="w-full text-left text-default-text">
          <thead>
            <tr>
              <th class="font-normal">Domain</th>
              <th class="font-normal">Type</th>
              <th class="font-normal">NSFW</th>
              <th class="font-normal">Config</th>
            </tr>
          </thead>

          <tbody class="text-default-text-muted">
            <template v-if="custom.boorus.length">
              <tr v-for="booru in custom.boorus" :key="booru.domain">
                <td @click="removeCustomBooruFromState(booru)">
                  {{ booru.domain }}
                </td>
                <td>{{ booru.type }}</td>
                <td>{{ booru.nsfw }}</td>
                <td>{{ booru.config !== null }}</td>
              </tr>
            </template>

            <!-- No boorus -->
            <template v-else>
              <tr>
                <td class="text-center" colspan="10">
                  There are no custom boorus
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <p class="p-2 text-xs text-center text-default-text-muted">
        Tip: Click on a booru domain to remove it
      </p>
    </div>

    <!-- Spacer -->
    <div class="flex-grow">&nbsp;</div>

    <!-- Booru editor -->
    <form
      class="flex flex-col p-4 material-container text-default-text"
      action="#"
      @submit.prevent="addCustomBooruToState(formBooru)"
    >
      <!-- Domain -->
      <label class="text-default-text-muted" for="booruDomain">Domain</label>

      <input
        id="booruDomain"
        v-model="formBooru.domain"
        type="text"
        name="booruDomain"
        value=""
        class="p-1 mt-1 mb-2 outline-none bg-background"
        required
        placeholder="example.com"
      />

      <!-- Type -->
      <label class="text-default-text-muted" for="booruType">
        Booru type
      </label>

      <select
        id="booruType"
        v-model="formBooru.type"
        name="booruType"
        class="p-1 mt-1 mb-2 outline-none bg-background w-max-content"
        required
      >
        <option
          v-for="booruType in booruTypeList"
          :key="booruType.type"
          :value="booruType.type"
        >
          {{ booruType.type }}
        </option>
      </select>

      <!-- NSFW -->
      <label class="text-default-text-muted" for="booruNSFW">NSFW</label>

      <input
        id="booruNSFW"
        v-model="formBooru.nsfw"
        name="booruNSFW"
        class="p-1 mt-1 mb-2 outline-none bg-background"
        type="checkbox"
      />

      <!-- Config -->
      <label class="text-default-text-muted" for="booruConfig">
        Configuration
      </label>

      <textarea
        id="booruConfig"
        v-model="formBooru.config"
        class="p-1 mt-1 mb-2 outline-none bg-background"
        name="booruConfig"
        rows="2"
      />

      <button type="button" class="text-sm text-default-text-muted">
        Test booru
      </button>

      <button
        type="submit"
        class="w-full px-2 py-1 mt-2 tracking-wide rounded-full shadow-md bg-gradient-blue-lilac"
      >
        Add
      </button>
    </form>
  </main>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

export default {
  data() {
    return {
      booruTypeList,

      formBooru: {
        domain: null,
        type: null,
        nsfw: true,
        config: null,
      },
    }
  },

  computed: {
    ...mapState('user', ['custom']),
  },

  methods: {
    ...mapActions('user', ['customBoorusManager']),
    ...mapActions('booru', ['activeBooruManager']),

    addCustomBooruToState(booruObj) {
      this.customBoorusManager({
        operation: 'add',
        value: { ...booruObj }, // Weird fix because it mutates the vuex store from here???
      })
    },

    removeCustomBooruFromState(booruObj) {
      this.customBoorusManager({
        operation: 'remove',
        value: booruObj,
      })

      this.activeBooruManager({ operation: 'reset' })
    },
  },
}
</script>
