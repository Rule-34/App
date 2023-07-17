<script lang="ts" setup>
  const { pageHistory } = usePageHistory()

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
  <!--  <SafeTeleport to="#navbar-actions">-->
  <!--    <NuxtLink-->
  <!--      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"-->
  <!--      href="/premium"-->
  <!--    >-->
  <!--      <span class="sr-only">Premium</span>-->

  <!--      <SparklesIcon class="h-6 w-6 text-base-content-highlight" />-->

  <!--      &lt;!&ndash; TODO: Add Highlighter, like in posts&ndash;&gt;-->
  <!--    </NuxtLink>-->
  <!--  </SafeTeleport>-->

  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="-mt-4 mb-8 text-center">
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

      <p class="mt-4">
        Stream and download rule 34 hentai images, GIFs and videos from multiple Boorus in a mobile-first web app
      </p>
    </div>

    <div class="space-y-4">
      <!-- Search -->
      <section>
        <PageHeader as="h2">
          <template #title>Search</template>
        </PageHeader>

        <!--        <SimpleSearch />-->
      </section>

      <!-- Featured tags -->
      <section>
        <PageHeader as="h2">
          <template #title>Featured tags</template>
        </PageHeader>

        <FeaturedTags class="-mx-4 px-4 py-2" />
      </section>

      <!-- TODO: Trending tags -->

      <!-- History -->
      <section v-if="pageHistory.length">
        <PageHeader as="h2">
          <template #title>History</template>
          <template #text>Continue where you left off</template>
        </PageHeader>

        <PageHistory class="mt-4" />
      </section>

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
