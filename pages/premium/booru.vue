<template>
  <main class="flex flex-col justify-around h-screen space-y-4 space-y-4-fixer">
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
      class="flex flex-col p-4 space-y-2 material-container text-default-text"
      action="#"
      @submit.prevent="addCustomBooruToState()"
    >
      <!-- Domain -->
      <label>
        <p class="mb-1 text-default-text-muted">Domain</p>

        <input
          v-model="formBooru.domain"
          type="text"
          name="booruDomain"
          value=""
          class="block w-full p-1 outline-none bg-background"
          required
          placeholder="example.com"
        />
      </label>

      <!-- Type -->
      <label>
        <p class="mb-1 text-default-text-muted">Booru type</p>

        <select
          v-model="formBooru.type"
          name="booruType"
          class="block p-1 outline-none bg-background w-max-content"
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
      </label>

      <!-- NSFW -->
      <label>
        <p class="mb-1 text-default-text-muted">NSFW</p>

        <input
          v-model="formBooru.nsfw"
          name="booruNSFW"
          class="block p-1 outline-none bg-background"
          type="checkbox"
        />
      </label>

      <!-- Configuration -->
      <label>
        <p class="mb-1 text-default-text-muted">Configuration</p>

        <textarea
          v-model="formBooru.config"
          class="block w-full p-1 outline-none bg-background"
          name="booruConfig"
          rows="2"
          spellcheck="false"
        />
      </label>

      <!-- <button type="button" class="text-sm text-default-text-muted">
        Test booru
      </button> -->

      <button
        type="submit"
        class="w-full px-2 py-1 tracking-wide rounded-full shadow-md bg-gradient-blue-lilac"
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
      let parsedConfig = null

      try {
        parsedConfig = JSON.parse(this.formBooru.config)
      } catch (error) {
        console.log(error)
        parsedConfig = null
      }

      this.customBoorusManager({
        operation: 'add',
        value: {
          ...this.formBooru,
          config: parsedConfig,
        },
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

  head() {
    return {
      title: 'Custom Boorus',
      meta: [
        {
          hid: 'customBoorus',
          name: 'description',
          content: 'Modify the Custom Boorus',
        },
      ],
    }
  },
}
</script>
