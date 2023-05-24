<script setup>
  useHead(() => {
    return {
      title: 'Legal',
      meta: [
        {
          name: 'description',
          content: 'Legal information.'
        }
      ]
    }
  })
</script>

<template>
  <main class="container mx-auto flex-1 px-4 sm:px-6 lg:px-8">
    <div class="mt-4 space-y-4">
      <ContentSeparator title="Legal" />

      <!-- Generated terms of service -->
      <ContentContainer
        :links="[
          {
            text: 'Terms of service',
            href: '/terms-of-service'
          }
        ]"
        text="You can find the Terms Of Service (TOS) in the next link"
        title="Terms of service"
      />

      <!-- Generated terms of service -->
      <ContentContainer
        :links="[
          {
            text: 'Privacy policy',
            href: '/privacy-policy'
          }
        ]"
        text="You can find the Privacy policy in the next link"
        title="Privacy policy"
      />

      <!-- Analytics -->
      <ContentContainer
        :links="[
          {
            text: 'Opt Out',
            href: '/privacy-policy#opt-out'
          }
        ]"
        text="Self hosted Matomo analytics are used, configured to NOT gather or store any personal info

				 Feel free to opt out on the next link"
        title="Analytics"
      />

      <!-- Contact -->
      <ContentContainer
        :links="[
          {
            text: 'contact@r34.app',
            href: 'mailto:contact@r34.app'
          }
        ]"
        text="Reach me to discuss questions, suggestions, requests, comments, or any other concern"
        title="Contact"
      />

      <ContentSeparator
        class="pt-4"
        title="Disclaimer"
      />

      <!-- Remove media -->
      <ContentContainer
        :links="[
          {
            text: 'Github repository',
            href: 'https://github.com/AlejandroAkbal/Rule-34-App'
          }
        ]"
        text="If you're the owner of a site where we get the media content and would like to cease these actions, please contact us with proof that you're the owner of that site and a message regarding the cease to actions

      Keep in mind that all the content we get is from public released APIs from the site itself"
        title="Media content disclaimer"
      />
    </div>
  </main>
</template>
