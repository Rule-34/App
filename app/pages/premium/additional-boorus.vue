<script lang="ts" setup>
  import { ArrowUturnLeftIcon, Bars2Icon, PencilIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
  import { vAutoAnimate } from '@formkit/auto-animate/vue'
  import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable'
  import type { Ref } from 'vue'
  import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
  import Slideover from '~/components/layout/Slideover.vue'

  const { t } = useI18n()
  const { toast } = useLazyToast()
  const localePath = useLocalePath()
  const { userBooruList } = useBooruList()
  const { initializeInBackground, setUserBooruList, resetUserBooruListCloud } = usePremiumCloudSync()

  onNuxtReady(() => {
    void initializeInBackground()
  })

  const sortableElement = shallowRef<HTMLElement | null>(null)

  type SortableUpdateEvent = {
    oldIndex?: number
    newIndex?: number
  }

  const sortable = useSortable(sortableElement, userBooruList, {
    handle: '.handle',
    animation: 150,

    onUpdate: (e: SortableUpdateEvent) => {
      const { oldIndex, newIndex } = e

      if (oldIndex == null || newIndex == null) {
        return
      }

      const nextBooruList = [...userBooruList.value]
      moveArrayElement(nextBooruList, oldIndex, newIndex)
      void setUserBooruList(nextBooruList)
    }
  })

  watch(
    userBooruList,
    (value) => {
      if (!sortableElement.value) {
        return
      }

      if (value.length > 2) {
        return
      }

      sortable.stop()
      sortable.start()
    },
    {
      immediate: true,
      deep: true
    }
  )

  const dialogOpen = shallowRef(false)

  type dialogModes = 'create' | 'update'

  const dialogEditIndex: Ref<number | null> = shallowRef(null)
  const dialogMode: ComputedRef<dialogModes> = computed(() => {
    if (dialogEditIndex.value !== null) {
      return 'update'
    }

    return 'create'
  })

  const currentBooru: Ref<{
    domain: string | undefined
    type: string | undefined
  }> = shallowRef({
    domain: undefined,
    type: undefined
  })

  async function resetUserBooruListToDefault() {
    if (!confirm(t('common.confirmResetBoorus'))) {
      return
    }

    await resetUserBooruListCloud()
  }

  function openCreateBooruDialog() {
    currentBooru.value = {
      domain: undefined,
      type: undefined
    }

    dialogEditIndex.value = null
    dialogOpen.value = true
  }

  function openEditBooru(index: number) {
    const booru = userBooruList.value[index]

    if (!booru) {
      return
    }

    currentBooru.value = {
      domain: booru.domain,
      type: booru.type.type
    }

    dialogEditIndex.value = index
    dialogOpen.value = true
  }

  async function onFormSubmit() {
    if (dialogMode.value === 'create') {
      await createBooru()
    } else {
      await editBooru()
    }
  }

  async function createBooru() {
    // Validations
    if (!currentBooru.value.domain || !currentBooru.value.type) {
      toast.error(t('toasts.fillOutAllFields'))
      return
    }

    const booruType = booruTypeList.find((booruType) => booruType.type === currentBooru.value.type)

    if (!booruType) {
      toast.error(t('toasts.invalidBooruType'))
      return
    }

    // TODO: Validate with Domain object

    if (userBooruList.value.find((booruFromList) => booruFromList.domain === currentBooru.value.domain)) {
      toast.error(t('toasts.booruAlreadyExists'))
      return
    }

    // TODO: Validate with Domain object
    const nextBooruList = [
      ...userBooruList.value,
      {
        domain: currentBooru.value.domain,
        type: booruType,

        config: null,

        isPremium: true,
        isCustom: true
      }
    ]

    if (await setUserBooruList(nextBooruList)) {
      dialogOpen.value = false
    }
  }

  async function editBooru() {
    // Validations
    if (!currentBooru.value.domain || !currentBooru.value.type) {
      toast.error(t('toasts.fillOutAllFields'))
      return
    }

    const booruType = booruTypeList.find((booruType) => booruType.type === currentBooru.value.type)

    if (!booruType) {
      toast.error(t('toasts.invalidBooruType'))
      return
    }

    const nextBooruList = [...userBooruList.value]

    // TODO: Validate with Domain object
    nextBooruList[dialogEditIndex.value!] = {
      domain: currentBooru.value.domain,
      type: booruType,

      config: null,

      isPremium: true,
      isCustom: true
    }

    if (await setUserBooruList(nextBooruList)) {
      dialogOpen.value = false
    }
  }

  async function deleteBooru() {
    const nextBooruList = userBooruList.value.filter((_, index) => index !== dialogEditIndex.value)

    if (await setUserBooruList(nextBooruList)) {
      dialogOpen.value = false
    }
  }

  useSeoMeta({
    title: computed(() => t('pages.premium.additionalBoorusPage.seoTitle'))
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.premium.landingPage.seoTitle'), item: localePath('/premium') },
        { name: t('pages.premium.additionalBoorusPage.seoTitle'), item: localePath('/premium/additional-boorus') }
      ]
    })
  ])

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <main class="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>{{ $t('pages.premium.additionalBoorusPage.pageTitle') }}</template>
      <template #text>{{ $t('pages.premium.additionalBoorusPage.pageDescription') }}</template>
    </PageHeader>

    <section class="mx-2 mt-4 flex-auto">
      <template v-if="!userBooruList.length">
        <div class="flex h-80 w-full flex-col items-center justify-center gap-4 text-center text-lg">
          <ExclamationCircleIcon
            aria-hidden="true"
            class="h-12 w-12"
          />

          <h3>{{ $t('pages.premium.additionalBoorusPage.emptyState') }}</h3>

          <span class="w-full overflow-x-auto text-sm italic">
            {{ $t('pages.premium.additionalBoorusPage.defaultCannotEdit') }}
          </span>
        </div>
      </template>

      <template v-else>
        <ol
          ref="sortableElement"
          v-auto-animate
          class="space-y-4"
        >
          <li
            v-for="(booru, index) in userBooruList"
            :key="booru.domain"
            class="flex w-full items-center gap-2"
          >
            <!-- Handle -->
            <div class="handle mr-2 cursor-move">
              <span class="sr-only">{{ $t('pages.premium.additionalBoorusPage.dragToReorder') }}</span>

              <Bars2Icon
                aria-hidden="true"
                class="h-4 w-4 text-base-content group-hover:text-base-content-hover"
              />
            </div>

            <!-- Favicon -->
            <img
              :alt="$t('common.favicon')"
              :src="useFaviconUrl(booru.domain)"
              class="h-5 w-5 shrink-0 rounded-sm"
              height="64"
              width="64"
            />

            <!-- Domain -->
            <span class="">
              {{ booru.domain }}
            </span>

            <!-- Take space -->
            <div class="flex-1" />

            <!-- Actions -->
            <div class="flex gap-2">
              <!-- Edit -->
              <button
                :aria-label="t('common.edit')"
                class="inline-flex items-center justify-center rounded-md p-2 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                type="button"
                @click="openEditBooru(index)"
              >
                <PencilIcon
                  aria-hidden="true"
                  class="h-4 w-4"
                />
              </button>
            </div>
          </li>
        </ol>
      </template>
    </section>

    <!-- Actions -->
    <section class="mt-4 flex items-center justify-between gap-2">
      <!-- Reset -->
      <button
        class="inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="resetUserBooruListToDefault"
      >
        <ArrowUturnLeftIcon
          aria-hidden="true"
          class="mr-2 h-4 w-4"
        />

        {{ $t('pages.premium.additionalBoorusPage.resetButton') }}
      </button>

      <!-- Add Booru -->
      <button
        class="inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="openCreateBooruDialog"
      >
        {{ $t('pages.premium.additionalBoorusPage.addBooruButton') }}

        <PlusIcon
          aria-hidden="true"
          class="mr-2 ml-2 h-4 w-4"
        />
      </button>
    </section>
  </main>

  <!-- Booru Dialog -->
  <Slideover
    :is-open="dialogOpen"
    @close="dialogOpen = false"
  >
    <template #title>{{
      dialogMode === 'create'
        ? $t('pages.premium.additionalBoorusPage.addTitle')
        : $t('pages.premium.additionalBoorusPage.editTitle')
    }}</template>

    <!--    <template #description> Remember to test the Booru before saving it</template>-->

    <div class="divide-y divide-gray-200 px-4 sm:px-6">
      <!-- Form -->
      <form
        id="booru-create-form"
        class="space-y-6 pt-6 pb-5"
        @submit.prevent="onFormSubmit"
      >
        <!-- Domain -->
        <div>
          <label
            class="block leading-8 font-medium text-base-content-highlight"
            for="domain"
          >
            {{ $t('pages.premium.additionalBoorusPage.domainLabel') }}
          </label>

          <div class="mt-2 flex rounded-md shadow-xs ring-1 ring-base-0/20 ring-inset">
            <span class="inline-flex items-center px-3 sm:text-sm">https://</span>

            <input
              id="domain"
              v-model="currentBooru.domain"
              aria-describedby="domain-description"
              class="flex-auto rounded-r-md border-base-0/20 bg-base-1000 px-2 py-1.5 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm sm:leading-6"
              name="domain"
              pattern="[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}"
              required
              type="text"
            />
          </div>

          <p
            id="domain-description"
            class="mt-2 text-sm"
          >
            {{ $t('pages.premium.additionalBoorusPage.domainDescription') }}
          </p>
        </div>

        <!-- Booru Type -->
        <div>
          <label
            class="block leading-8 font-medium text-base-content-highlight"
            for="type"
          >
            {{ $t('pages.premium.additionalBoorusPage.typeLabel') }}
          </label>

          <select
            id="type"
            v-model="currentBooru.type"
            aria-describedby="type-description"
            class="mt-2 block w-full rounded-md border-base-0/20 bg-base-1000 py-1.5 pr-10 pl-3 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm sm:leading-6"
            name="type"
            required
          >
            <option
              v-for="type in booruTypeList"
              :key="type.type"
              :value="type.type"
            >
              {{ type.type }}
            </option>
          </select>

          <p
            id="type-description"
            class="mt-2 text-sm"
          >
            {{ $t('pages.premium.additionalBoorusPage.typeDescription') }}

            <span class="mt-2 block text-xs italic"> {{ $t('pages.premium.additionalBoorusPage.typeNote') }} </span>
          </p>
        </div>
      </form>
    </div>

    <template #actions>
      <button
        v-if="dialogMode === 'update'"
        class="mr-auto inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="deleteBooru"
      >
        {{ $t('pages.premium.additionalBoorusPage.deleteButton') }}
      </button>

      <!-- TODO: Test Booru functionality -->
      <!--      <button-->
      <!--        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20"-->
      <!--        type="button"-->
      <!--      >-->
      <!--        Test Booru-->
      <!--      </button>-->

      <button
        class="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        form="booru-create-form"
        type="submit"
      >
        {{
          dialogMode === 'create'
            ? $t('pages.premium.additionalBoorusPage.addButton')
            : $t('pages.premium.additionalBoorusPage.saveButton')
        }}
      </button>
    </template>
  </Slideover>
</template>
