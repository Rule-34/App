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
              href: '/terms-of-service',
              target: '_blank'
            }
          ]"
          text="You can find the Terms Of Service (TOS) in the next link"
          title="Terms of service"
        />
      </li>

      <!-- Generated terms of service -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'Privacy policy',
              href: '/privacy-policy',
              target: '_blank'
            }
          ]"
          text="You can find the Privacy policy in the next link"
          title="Privacy policy"
        />
      </li>

      <!-- Analytics -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'Opt Out',
              href: '/privacy-policy#opt-out',
              target: '_blank'
            }
          ]"
          text="Self hosted Matomo analytics are used, configured to NOT gather, or store, any personal info

				 Feel free to opt out on the next link"
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
          text="Reach me to discuss questions, suggestions, requests, comments, or any other concern"
          title="Contact"
        />
      </li>
    </ol>

    <PageHeader
      as="h2"
      class="mt-14"
    >
      <template #title>Miscelaneous</template>
    </PageHeader>

    <ol class="mx-2 mt-4 space-y-4">
      <!-- Remove media -->
      <li>
        <ContentContainer
          :links="[
            {
              text: 'Github repository',
              href: 'https://github.com/AlejandroAkbal/Rule-34-App',
              target: '_blank'
            }
          ]"
          text="If you're the owner of a site where we get the media content and would like to cease these actions, please contact us with proof that you're the owner of that site and a message regarding the cease to actions

      Keep in mind that all the content we get is from public released APIs from the site itself"
          title="Media content disclaimer"
        />
      </li>
    </ol>
  </main>
</template>
