<script lang="ts" setup>
  import { ClientResponseError } from 'pocketbase'

  const { $pocketBase } = useNuxtApp()

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
      const authData = await $pocketBase.collection('users').authWithPassword(password, password)
    } catch (error) {
      if (error instanceof ClientResponseError) {
        toast.error(error.message)
        return
      }
    }

    await navigateTo('/premium/dashboard')
  }

  onNuxtReady(() => {
    const route = useRoute()
    const message = route.query.message
    const license = route.query.license

    // TODO: Add action to contact support
    if (message) {
      toast.info(message)
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
    title: 'Sign in',

    description: 'Sign in to the Rule 34 App.'
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
          <template #title>Sign in</template>
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
                License
              </label>
              <div class="text-sm">
                <NuxtLink
                  class="hover:hover-text-util focus-visible:focus-outline-util font-semibold"
                  href="/premium/forgot-password"
                  rel="noopener"
                >
                  Forgot license?
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
              Sign in
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm">
          Not a Premium member?

          {{ ' ' }}

          <NuxtLink
            class="focus-visible:focus-outline-util text-primary-400 hover:text-primary-300 leading-6 font-semibold"
            href="/premium"
          >
            Subscribe now
          </NuxtLink>
        </p>
      </div>
    </section>
  </main>
</template>
