<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div>
      <!-- Booru list -->
      <div class="px-2 py-1 overflow-x-scroll rounded-container">
        <table
          class="w-full text-left border-separate"
          style="border-spacing: 0.25em"
        >
          <thead>
            <tr>
              <th class="font-normal text-default-text">Domain</th>
              <th class="font-normal text-default-text">Type</th>
              <th class="font-normal text-default-text">NSFW</th>
              <th class="font-normal text-default-text">Config</th>
            </tr>
          </thead>

          <tbody class="text-default-text-muted">
            <template v-if="getCustomBoorus.length">
              <tr v-for="booru in getCustomBoorus" :key="booru.domain">
                <td class="text-sm" @click="removeCustomBooru(booru)">
                  {{ booru.domain }}
                </td>
                <td class="text-sm" @click="copyBooruToForm(booru)">
                  {{ booru.type }}
                </td>
                <td class="text-sm">{{ booru.nsfw }}</td>
                <td class="text-sm">{{ booru.config !== null }}</td>
              </tr>
            </template>

            <!-- No boorus -->
            <template v-else>
              <tr>
                <td class="text-sm text-center" colspan="999">
                  There are no custom boorus
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <p class="p-2 text-xs text-center text-default-text-muted">
        Click on the `domain` to remove. Click on the `type` to copy.
      </p>
    </div>

    <!-- Spacer -->
    <div class="flex-auto">&nbsp;</div>

    <!-- Booru editor -->
    <form
      class="flex flex-col p-4 space-y-2 rounded-container text-default-text"
      @submit.prevent="addFormBooruToCustomBoorus"
    >
      <!-- Domain -->
      <label>
        <p class="mb-1 text-default-text-muted">Domain</p>

        <input
          v-model="formBooru.domain"
          type="text"
          name="booruDomain"
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
import { mapGetters, mapActions } from 'vuex'

import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/dist/util/BooruUtils.js'

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

  head() {
    return {
      title: 'Custom Boorus',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Add custom Boorus',
        },
      ],
    }
  },

  computed: {
    ...mapGetters('user', ['getCustomBoorus']),
  },

  methods: {
    ...mapActions('user', ['customBoorusManager']),

    addFormBooruToCustomBoorus(booruObj) {
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

    removeCustomBooru(booruObj) {
      this.customBoorusManager({
        operation: 'remove',
        value: booruObj,
      })
    },

    copyBooruToForm(booru) {
      // Clone as a weird fix so Vuex does not crash
      this.formBooru = {
        domain: booru.domain,
        type: booru.type,
        nsfw: booru.nsfw,
        config: JSON.stringify(booru.config),
      }
    },
  },
}
</script>
