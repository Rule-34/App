<script setup>
  import { project } from '@/config/project'

  useSeoMeta({
    title: 'DMCA Notice of Copyright infringement',

    description: `Learn how to submit a DMCA notice of copyright infringement to ${project.name}`
  })
</script>

<template>
  <main class="richtext container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>DMCA Notice</template>
    </PageHeader>

    <div>
      <p>
        {{ project.name }} ({{ project.urls.production.toString() }}) is a search engine that indexes and links to
        content hosted on third-party websites. We do not host any content ourselves. If you believe that your
        copyrighted work has been infringed upon by a website that we link to, please follow these steps:
      </p>

      <ol>
        <li>
          <strong>Identify the Website Hosting the Content</strong>: Locate the specific website that is hosting the
          allegedly infringing content, its usually indicated on the top of the page, or at the URL.
        </li>
        <li>
          <strong>Contact the Website Owner</strong>: As we do not host the content, you will need to contact the owner
          or administrator of the website hosting the content to request its removal. Most websites have a DMCA or
          copyright infringement process outlined on their site.
        </li>
      </ol>

      <p>
        Please note that {{ project.name }} cannot process DMCA notices or remove content from third-party websites.
        We are merely a search engine that indexes and links to content hosted elsewhere on the internet. If you have
        any further questions or concerns, please contact us at {{ project.email }}.
      </p>
    </div>
  </main>
</template>
