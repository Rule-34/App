<script setup>
  import { project } from '~~/config/project'

  const localePath = useLocalePath()
  const { t } = useI18n()

  useSeoMeta({
    title: () => t('pages.legal.title'),
    description: () => t('pages.legal.description', { name: project.name })
  })

  useSchemaOrg(() => [
    defineBreadcrumb({
      // Breadcrumb items stay locale-relative; production-absolute URLs are reserved for canonicals.
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.legal.title'), item: localePath('/legal') }
      ]
    }),
    defineWebPage()
  ])
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>{{ $t('pages.legal.title') }}</template>
    </PageHeader>

    <ol class="mx-2 mt-4 space-y-4">
      <!-- Privacy policy -->
      <li>
        <ContentContainer
          :links="[
            {
              text: $t('pages.legal.privacyPolicy'),
              href: localePath('/privacy-policy')
            }
          ]"
          :text="$t('pages.legal.privacyPolicyText')"
          :title="$t('pages.legal.privacyPolicy')"
        />
      </li>

      <!-- Terms of Service -->
      <li>
        <ContentContainer
          :links="[
            {
              text: $t('pages.legal.termsOfService'),
              href: localePath('/terms-of-service')
            }
          ]"
          :text="$t('pages.legal.termsOfServiceText')"
          :title="$t('pages.legal.termsOfService')"
        />
      </li>

      <!-- Cookie policy -->
      <li>
        <ContentContainer
          :links="[
            {
              text: $t('pages.legal.cookiePolicy'),
              href: localePath('/cookie-policy')
            }
          ]"
          :text="$t('pages.legal.cookiePolicyText')"
          :title="$t('pages.legal.cookiePolicy')"
        />
      </li>

      <!-- DMCA -->
      <li>
        <ContentContainer
          :links="[
            {
              text: $t('pages.legal.dmca'),
              href: localePath('/dmca')
            }
          ]"
          :text="$t('pages.legal.dmcaText')"
          :title="$t('pages.legal.dmca')"
        />
      </li>

      <!-- Contact -->
      <li>
        <ContentContainer
          :links="[
            {
              text: project.email,
              href: `mailto:${project.email}`,
              target: '_blank'
            }
          ]"
          :text="$t('pages.legal.contactText')"
          :title="$t('pages.legal.contactTitle')"
        />
      </li>
    </ol>
  </main>
</template>
