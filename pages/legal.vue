<script setup>
  import { project } from '@/config/project'

  useSeoMeta({
    title: 'Legal',

    description: `Legal information about ${project.name}`
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Legal</template>
    </PageHeader>

    <ol class="mx-2 mt-4 space-y-4">
      <!-- Privacy policy -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'Privacy policy',
              href: '/privacy-policy'
            }
          ]"
          text="You can find the privacy policy in the next link"
          title="Privacy policy"
        />
      </li>

      <!-- Terms of Service -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'Terms of service',
              href: '/terms-of-service'
            }
          ]"
          text="You can find the terms of service in the next link"
          title="Terms of service"
        />
      </li>

      <!-- Cookie policy -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'Cookie policy',
              href: '/cookie-policy'
            }
          ]"
          text="You can find the cookie policy in the next link"
          title="Cookie policy"
        />
      </li>

      <!-- DMCA -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'DMCA',
              href: '/dmca'
            }
          ]"
          text="Want to submit a takedown request? You can find more information in the next link"
          title="DMCA Notice"
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
          text="Reach us for any question, suggestion, request, or any other concern"
          title="Contact"
        />
      </li>
    </ol>
  </main>
</template>
