<script setup>
  import { project } from '~~/config/project'

  const { t } = useI18n()
  const localePath = useLocalePath()

  useSeoMeta({
    title: computed(() => t('pages.legal.dmcaSeoTitle')),
    description: computed(() => t('pages.legal.dmcaDescription', { name: project.name }))
  })

  useSchemaOrg(() => [
    defineBreadcrumb({
      // Breadcrumb items stay locale-relative; production-absolute URLs are reserved for canonicals.
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.legal.dmca'), item: localePath('/dmca') }
      ]
    }),
    defineWebPage()
  ])
</script>

<template>
  <main class="richtext container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>{{ $t('pages.legal.dmca') }}</template>
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
          allegedly infringing content, it's usually indicated on the top of the page, or at the URL.
        </li>
        <li>
          <strong>Contact the Website Owner</strong>: As we do not host the content, you will need to contact the owner
          or administrator of the website hosting the content to request its removal. Most websites have a DMCA or
          copyright infringement process outlined on their site.
        </li>
      </ol>

      <p>
        {{ project.name }} respects intellectual property rights and complies with applicable copyright provisions under
        17 U.S.C. § 512(d). While we do not host third-party files directly, we review valid notifications and promptly
        remove or disable access to links and search results indexing allegedly infringing material. To submit a link
        removal notice, please contact us with the specific URLs at {{ project.email }}.
      </p>
    </div>
  </main>
</template>
