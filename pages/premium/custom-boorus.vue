<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div>
      <!-- Booru list -->
      <div class="px-2 py-1 overflow-x-scroll material-container">
        <table
          class="w-full text-left border-separate"
          style="border-spacing: 0.25em"
        >
          <thead>
            <tr>
              <th class="text-lg font-normal text-gray-200">Domain</th>
              <th class="text-lg font-normal text-gray-200">Type</th>
              <th class="text-lg font-normal text-gray-200">NSFW</th>
              <th class="text-lg font-normal text-gray-200">Config</th>
            </tr>
          </thead>

          <tbody class="text-gray-300">
            <template v-if="getCustomBoorus.length">
              <tr v-for="booru in getCustomBoorus" :key="booru.domain">
                <td @click="removeCustomBooru(booru)">
                  {{ booru.domain }}
                </td>

                <td @click="copyBooruToForm(booru)">
                  {{ booru.type }}
                </td>

                <td>{{ booru.nsfw }}</td>

                <td>{{ booru.config !== null }}</td>
              </tr>
            </template>

            <!-- No boorus -->
            <template v-else>
              <tr>
                <td class="text-center" colspan="999">
                  There are no custom boorus
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <p class="p-2 text-xs text-center text-gray-300">
        Click on the `domain` to remove. Click on the `type` to copy.
      </p>
    </div>

    <!-- Spacer -->
    <div class="flex-auto">&nbsp;</div>

    <!-- Booru editor -->
    <form
      class="flex flex-wrap gap-4 p-4 material-container"
      @submit.prevent="addFormBooruToCustomBoorus"
    >
      <!-- Domain -->
      <label class="space-y-1">
        <p class="text-gray-200">Domain</p>

        <input
          v-model="formBooru.domain"
          type="text"
          name="domain"
          class="block h-8 p-1 text-gray-300 outline-none border-util bg-darkGray-700 focus:focus-util"
          required
          placeholder="example.com"
        />
      </label>

      <!-- Type -->
      <label class="space-y-1">
        <p class="text-gray-200">Booru type</p>

        <select
          v-model="formBooru.type"
          name="type"
          class="block h-8 p-1 text-gray-300 outline-none bg-darkGray-700 border-util w-max focus:focus-util"
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
      <label class="flex flex-col space-y-1">
        <p class="text-gray-200">NSFW</p>

        <input
          v-model="formBooru.nsfw"
          name="nsfw"
          class="self-center flex-auto block p-1 outline-none bg-darkGray-700 focus:focus-util"
          type="checkbox"
        />
      </label>

      <!-- Configuration -->
      <label class="flex-auto space-y-1">
        <p class="text-gray-200">Configuration</p>

        <textarea
          v-model="formBooru.config"
          class="block w-full p-1 text-gray-300 outline-none border-util bg-darkGray-700 focus:focus-util"
          name="config"
          rows="3"
          spellcheck="false"
        />
      </label>

      <!-- <button type="button" class="text-sm text-gray-200">
        Test booru
      </button> -->

      <button
        type="submit"
        class="w-full px-2 py-1 tracking-wide rounded-full bg-gradient-to-r from-primary-400 to-accent-400 focus:focus-util"
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
          content: 'Add more Boorus.',
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
