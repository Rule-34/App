<script lang="ts" setup>
  import { ClientResponseError } from 'pocketbase'
  import { toast } from 'vue-sonner'
  import { project } from '@/config/project'

  const { $pocketBase } = useNuxtApp()
  const localePath = useLocalePath()
  const { t } = useI18n()

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
    }

    await navigateTo({
      path: localePath('/premium/dashboard'),
      query: { initialLogin: 'true' }
    })
  }

  onNuxtReady(() => {
    const route = useRoute()
    const license = route.query.license

    if (route.query.authFailed) {
      toast.info(t('toasts.authFailed'))
    }

    if (license) {
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
                class="text-base-content-highlight block text-sm leading-6 font-medium"
                for="license"
              >
                {{ $t('pages.premium.signIn.licenseLabel') }}
              </label>
              <div class="text-sm">
                <NuxtLink
                  :href="localePath('/premium/forgot-password')"
                  class="hover:hover-text-util focus-visible:focus-outline-util font-semibold"
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
                class="focus-visible:focus-outline-util text-base-content-highlight ring-base-0/20 block w-full rounded-md border-0 bg-transparent py-1.5 shadow-xs ring-1 ring-inset sm:text-sm sm:leading-6"
                name="password"
                required
                type="password"
              />
            </div>
          </div>

          <div>
            <button
              class="focus-visible:focus-outline-util hover:hover-text-util bg-primary-500 text-base-content-highlight hover:bg-primary-400 flex w-full justify-center rounded-md px-3 py-1.5 text-sm leading-6 font-semibold shadow-xs"
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
            class="focus-visible:focus-outline-util text-primary-400 hover:text-primary-300 leading-6 font-semibold"
          >
            {{ $t('pages.premium.signIn.subscribeNow') }}
          </NuxtLink>
        </p>
      </div>
    </section>
  </main>
</template>
