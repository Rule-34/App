<script lang="ts" setup>
  import { toast } from 'vue-sonner'

  const { signIn } = useAuth()

  const formData = ref({
    password: ''
  })

  async function onSubmit(event: Event) {
    const password = formData.value.password

    if (!password) {
      return
    }

    const signInResult = await signIn('credentials', { username: '_', password, redirect: false })
      //
      .catch((error) => ({ error, url: undefined }))

    const signInError = signInResult?.error

    if (signInError) {
      if (signInError.status === 401) {
        toast.error('Invalid license key, check it and try again')
        return
      }

      toast.error(signInError.message)
      return
    }

    await navigateTo('/premium')
  }

  useSeoMeta({
    title: 'Sign in',

    description: 'Sign in to the Rule 34 App.'
  })

  definePageMeta({
    middleware: 'auth',

    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/premium'
    }
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
                class="block text-sm font-medium leading-6 text-base-content-highlight"
                for="license"
              >
                License
              </label>
              <div class="text-sm">
                <NuxtLink
                  class="hover:hover-text-util focus-visible:focus-outline-util font-semibold"
                  href="https://app.gumroad.com/library?query=Rule+34+App"
                  target="_blank"
                >
                  Forgot license?
                </NuxtLink>
              </div>
            </div>

            <div class="mt-2">
              <input
                id="license"
                v-model.trim="formData.password"
                autocomplete="current-password"
                class="focus-visible:focus-outline-util block w-full rounded-md border-0 bg-base-0/5 py-1.5 text-base-content-highlight shadow-sm ring-1 ring-inset ring-base-0/10 focus-visible:ring-inset sm:text-sm sm:leading-6"
                name="password"
                required
                type="password"
              />
            </div>
          </div>

          <div>
            <button
              class="focus-visible:focus-outline-util hover:hover-text-util flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-base-content-highlight shadow-sm hover:bg-primary-400"
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
            class="focus-visible:focus-outline-util font-semibold leading-6 text-primary-400 hover:text-primary-300"
            href="/premium"
          >
            Subscribe now
          </NuxtLink>
        </p>
      </div>
    </section>
  </main>
</template>
