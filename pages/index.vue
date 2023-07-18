<script lang="ts" setup>
  import { toast } from 'vue-sonner'
  import { Ref } from 'vue'
  import Tag from 'assets/js/tag.dto'
  import { useBooruList } from '~/composables/useBooruList'

  const config = useRuntimeConfig()

  const { pageHistory } = usePageHistory()

  const { booruList } = useBooruList()
  const { selectedDomainFromStorage } = useSelectedDomainFromStorage()

  const selectedBooru = computed(() => {
    let domain = selectedDomainFromStorage.value

    // Fallback to first Booru
    if (!domain) {
      return booruList.value[0]
    }

    const booru = booruList.value.find((booru) => booru.domain === domain)

    if (!booru) {
      toast.error(`Booru "${domain}" not found`)
      throw new Error(`Booru "${domain}" not found`)
    }

    // Save selected booru to storage
    selectedDomainFromStorage.value = booru.domain

    return booru
  })

  const searchTagResults: Ref<Tag[]> = ref([])

  async function onSearchTag(tag: string) {
    const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/tags'

    const response = await $fetch(apiUrl, {
      params: {
        baseEndpoint: selectedBooru.value.domain,

        tag,
        order: 'count',
        limit: 20
      },

      onResponseError(context) {
        if (context.response.status === 404) {
          searchTagResults.value = []
          return
        }

        toast.error(`Failed to load tags: "${context.response.statusText}"`)
      }
    })

    searchTagResults.value = response.data
  }

  function onSearchSubmit(tag?: string | undefined) {
    navigateTo({
      path: '/posts',
      query: {
        tags: tag
      }
    })
  }

  definePageMeta({
    middleware: [
      /**
       * Redirect to /posts if there are any query parameters.
       */
      function (to, from) {
        if (Object.keys(to.query).length === 0) {
          return
        }

        return navigateTo({ path: '/posts', query: to.query, hash: to.hash })
      }
    ]
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="-mt-4 text-center">
      <h1
        class="flex justify-center gap-2 text-2xl font-bold uppercase leading-10 tracking-tight text-base-content-highlight"
      >
        R34

        <img
          alt="Icon"
          class="flip-vertical-fwd h-6 w-6 text-base-content-highlight"
          height="16"
          loading="eager"
          src="/icon.svg"
          width="16"
        />

        App
      </h1>

      <p class="mt-2">
        Stream and download rule 34 hentai images, GIFs and videos from multiple Boorus in a mobile-first web app
      </p>
    </div>

    <div class="mt-8 space-y-8">
      <!-- Search -->
      <section>
        <PageHeader as="h2">
          <template #title>Search</template>
        </PageHeader>

        <div class="mt-2 flex items-center gap-2">
          <DomainSelector
            :boorus="booruList"
            :compact="true"
            :model-value="selectedBooru"
            @update:model-value="onDomainChange"
          />

          <SimpleSearch
            :tag-results="searchTagResults"
            class="flex-auto"
            @submit="onSearchSubmit"
            @search-tag="onSearchTag"
          />
        </div>
      </section>

      <!-- History -->
      <section v-if="pageHistory.length">
        <PageHeader as="h2">
          <template #title>History</template>
          <template #text>Continue where you left off</template>
        </PageHeader>

        <PageHistory class="mt-4" />
      </section>

      <!-- Featured tags -->
      <section>
        <PageHeader as="h2">
          <template #title>Featured tags</template>
        </PageHeader>

        <FeaturedTags class="-mx-4 px-4 py-2" />
      </section>

      <!-- TODO: Trending tags -->

      <!-- News -->
      <section>
        <PageHeader as="h2">
          <template #title>News & updates</template>
        </PageHeader>

        <!-- TODO: Learn how to install the App on your device -->
        <!-- TODO: Feedback form -->
      </section>
    </div>
  </main>

  <footer>
    <!--  TODO: Footer -->
    <!--  TODO: Footer link to legal page -->
    <!--  TODO: Footer link to social media -->
  </footer>
</template>

<style>
  #navbar {
    border-bottom: transparent;
  }

  #navbar-logo {
    visibility: hidden;
  }
</style>
