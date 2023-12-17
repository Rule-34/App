<script setup>
  useSeoMeta({
    title: 'Legal',

    description: 'Legal information about the Rule 34 App'
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Legal</template>
    </PageHeader>

    <ol class="mx-2 mt-4 space-y-4">
      <!-- Generated terms of service -->
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

      <!-- Generated terms of service -->
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

      <!-- Analytics -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'Opt Out',
              href: '/privacy-policy#opt-out'
            }
          ]"
          text="We use first party analytics that do not gather or store any personal info

				 Feel free to opt out of being tracked on the next link"
          title="Analytics"
        />
      </li>

      <!-- Contact -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'contact@r34.app',
              href: 'mailto:contact@r34.app',
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
