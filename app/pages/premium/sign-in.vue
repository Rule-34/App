<script lang="ts" setup>
  import { ClientResponseError } from 'pocketbase'
  import { project } from '~~/config/project'

  const { $pocketBase } = useNuxtApp()
  const localePath = useLocalePath()
  const { t } = useI18n()
  const { toast } = useLazyToast()

  const formData = shallowRef({
    password: ''
  })

  async function onSubmit() {
    const password = formData.value.password

    if (!password) {
      return
    }

    // Authenticate to pocketbase
    try {
      await $pocketBase.collection('users').authWithPassword(password, password)
    } catch (error) {
      if (error instanceof ClientResponseError) {
        toast.error(error.message)
        return
      }

      console.error(error)
      toast.error(t('toasts.authFailed'))
      return
    }

    window.location.href = localePath({ path: '/premium/dashboard', query: { initialLogin: 'true' } })
  }

  onNuxtReady(() => {
    const route = useRoute()
    const license = Array.isArray(route.query.license) ? route.query.license[0] : route.query.license

    if (route.query.authFailed) {
      toast.info(t('toasts.authFailed'))
    }

    if (typeof license === 'string' && license) {
      if ($pocketBase.authStore.isValid) {
        $pocketBase.authStore.clear()
      }

      formData.value.password = license

      onSubmit()
    }
  })

  useSeoMeta({
    title: computed(() => t('pages.premium.signIn.seoTitle')),
    description: computed(() => t('pages.premium.signIn.seoDescription', { name: project.name }))
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.premium.landingPage.seoTitle'), item: localePath('/premium') },
        { name: t('pages.premium.signIn.seoTitle'), item: localePath('/premium/sign-in') }
      ]
    })
  ])

  definePageMeta({
    middleware: 'auth-redirect-if-logged-in'
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <!-- Sign in -->
    <section class="-mt-12 flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <PageHeader class="text-center">
          <template #title>{{ $t('pages.premium.signIn.pageTitle') }}</template>
        </PageHeader>
      </div>

      <div class="mt-24 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          class="space-y-6"
          @submit.prevent="onSubmit"
        >
          <div>
            <!-- License key-->
            <div class="flex items-center justify-between">
              <label
                class="block text-sm leading-6 font-medium text-base-content-highlight"
                for="license"
              >
                {{ $t('pages.premium.signIn.licenseLabel') }}
              </label>
              <div class="text-sm">
                <NuxtLink
                  :href="localePath('/premium/forgot-password')"
                  class="font-semibold hover:hover-text-util focus-visible:focus-outline-util"
                  rel="noopener"
                >
                  {{ $t('pages.premium.signIn.forgotLicense') }}
                </NuxtLink>
              </div>
            </div>

            <div class="mt-2">
              <!-- Fake username for password autofill -->
              <input
                id="username"
                autocomplete="username"
                name="username"
                style="display: none"
                type="text"
                value="_"
              />

              <input
                id="license"
                v-model.trim="formData.password"
                autocomplete="current-password"
                class="block w-full rounded-md border-0 bg-transparent py-1.5 text-base-content-highlight shadow-xs ring-1 ring-base-0/20 ring-inset focus-visible:focus-outline-util sm:text-sm sm:leading-6"
                name="password"
                required
                type="password"
              />
            </div>
          </div>

          <div>
            <button
              class="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm leading-6 font-semibold text-base-content-highlight shadow-xs hover:bg-primary-400 hover:hover-text-util focus-visible:focus-outline-util"
              type="submit"
            >
              {{ $t('pages.premium.signIn.signInButton') }}
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm">
          {{ $t('pages.premium.signIn.notMember') }}

          {{ ' ' }}

          <NuxtLink
            :href="localePath('/premium')"
            class="leading-6 font-semibold text-primary-400 hover:text-primary-300 focus-visible:focus-outline-util"
          >
            {{ $t('pages.premium.signIn.subscribeNow') }}
          </NuxtLink>
        </p>
      </div>
    </section>
  </main>
</template>
