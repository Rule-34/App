<script lang="ts" setup>
  import { toast } from 'vue-sonner'

  const { $pocketBase } = useNuxtApp()

  const formData = shallowRef({
    email: ''
  })

  async function onSubmit() {
    const email = formData.value.email

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      return
    }

    try {
      const response = await $fetch('https://n8n.akbal.dev/webhook/r34/pocketbase/forgot-password', {
        method: 'POST',
        body: {
          email: cleanEmail
        }
      })

      toast.success(response.message, {
        duration: 1000 * 30 // 30 seconds
      })
    } catch (error) {
      toast.error(`Failed to send email: ${error}`)
      return
    }
  }

  useSeoMeta({
    title: 'Forgot license',

    description: 'Recover your Rule 34 App license key.'
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
          <template #title>Forgot license?</template>
          <template #text>Enter your email and we'll send it to you</template>
        </PageHeader>
      </div>

      <div class="mt-24 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          class="space-y-6"
          @submit.prevent="onSubmit"
        >
          <div>
            <!-- Email-->
            <div class="flex items-center justify-between">
              <label
                class="block text-sm font-medium leading-6 text-base-content-highlight"
                for="email"
              >
                Email
              </label>
            </div>

            <div class="mt-2">
              <input
                id="email"
                v-model.trim="formData.email"
                autocomplete="email"
                class="focus-visible:focus-outline-util block w-full rounded-md border-0 bg-transparent py-1.5 text-base-content-highlight shadow-sm ring-1 ring-inset ring-base-0/20 sm:text-sm sm:leading-6"
                name="email"
                required
                type="email"
              />
            </div>
          </div>

          <div>
            <button
              class="focus-visible:focus-outline-util hover:hover-text-util flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-base-content-highlight shadow-sm hover:bg-primary-400"
              type="submit"
            >
              Send license
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm">
          Got your license key?

          {{ ' ' }}

          <NuxtLink
            class="focus-visible:focus-outline-util font-semibold leading-6 text-primary-400 hover:text-primary-300"
            href="/premium/sign-in"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>
    </section>
  </main>
</template>
