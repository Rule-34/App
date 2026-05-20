<script lang="ts" setup>
  import { project } from '~~/config/project'

  const { t } = useI18n()
  const { toast } = useLazyToast()
  const localePath = useLocalePath()
  const { $pocketBase } = useNuxtApp()

  const formData = shallowRef({
    email: ''
  })

  type PasswordResetError = {
    response?: {
      data?: {
        email?: {
          message?: string
        }
      }
    }
    message?: string
  }

  function getPasswordResetErrorMessage(error: unknown) {
    if (typeof error === 'object' && error !== null) {
      const passwordResetError = error as PasswordResetError
      return passwordResetError.response?.data?.email?.message ?? passwordResetError.message ?? String(error)
    }

    return String(error)
  }

  async function onSubmit() {
    const email = formData.value.email

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      return
    }

    try {
      await $pocketBase.collection('users').requestPasswordReset(cleanEmail)

      toast.success(t('toasts.emailSent'), {
        description: t('toasts.emailSentDescription'),
        duration: 1000 * 30 // 30 seconds
      })
    } catch (error) {
      toast.error(t('toasts.failedToSendEmail', { message: getPasswordResetErrorMessage(error) }))
      return
    }
  }

  useSeoMeta({
    title: computed(() => t('pages.premium.forgotPassword.seoTitle')),
    description: computed(() => t('pages.premium.forgotPassword.seoDescription', { name: project.name }))
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.premium.landingPage.seoTitle'), item: localePath('/premium') },
        { name: t('pages.premium.forgotPassword.seoTitle'), item: localePath('/premium/forgot-password') }
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
          <template #title>{{ $t('pages.premium.forgotPassword.pageTitle') }}</template>
          <template #text>{{ $t('pages.premium.forgotPassword.pageDescription') }}</template>
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
                class="block text-sm leading-6 font-medium text-base-content-highlight"
                for="email"
              >
                {{ $t('pages.premium.forgotPassword.emailLabel') }}
              </label>
            </div>

            <div class="mt-2">
              <input
                id="email"
                v-model.trim="formData.email"
                autocomplete="email"
                class="block w-full rounded-md border-0 bg-transparent py-1.5 text-base-content-highlight shadow-xs ring-1 ring-base-0/20 ring-inset focus-visible:focus-outline-util sm:text-sm sm:leading-6"
                name="email"
                required
                type="email"
              />
            </div>
          </div>

          <div>
            <button
              class="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm leading-6 font-semibold text-base-content-highlight shadow-xs hover:bg-primary-400 hover:hover-text-util focus-visible:focus-outline-util"
              type="submit"
            >
              {{ $t('pages.premium.forgotPassword.sendLicense') }}
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm">
          {{ $t('pages.premium.forgotPassword.gotLicense') }}

          {{ ' ' }}

          <NuxtLink
            :href="localePath('/premium/sign-in')"
            class="leading-6 font-semibold text-primary-400 hover:text-primary-300 focus-visible:focus-outline-util"
          >
            {{ $t('pages.premium.forgotPassword.signIn') }}
          </NuxtLink>
        </p>
      </div>
    </section>
  </main>
</template>
