<script lang="ts" setup>
  import { ArrowUturnLeftIcon, Bars2Icon, PencilIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
  import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable'
  import type { Ref } from 'vue'
  import { toast } from 'vue-sonner'
  import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
  import Slideover from '~/components/layout/Slideover.vue'

  const { userBooruList, resetUserBooruList } = useBooruList()

  const sortableElement = ref<HTMLElement | null>(null)

  const sortable = useSortable(sortableElement, userBooruList, {
    handle: '.handle',
    animation: 150,

    onUpdate: (e: any) => {
      nextTick(() => {
        moveArrayElement(userBooruList.value, e.oldIndex, e.newIndex)
      })
    }
  })

  watch(
    userBooruList,
    (value, oldValue) => {
      if (!sortableElement.value) {
        return
      }

      if (value.length > 2) {
        return
      }

      console.log(value.length, oldValue?.length)
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

  function resetUserBooruListToDefault() {
    if (!confirm('Are you sure you want to reset all Boorus to default?')) {
      return
    }

    resetUserBooruList()
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

    currentBooru.value = {
      domain: booru.domain,
      type: booru.type.type
    }

    dialogEditIndex.value = index
    dialogOpen.value = true
  }

  function onFormSubmit() {
    if (dialogMode.value === 'create') {
      createBooru()
    } else {
      editBooru()
    }
  }

  function createBooru() {
    // Validations
    if (!currentBooru.value.domain || !currentBooru.value.type) {
      toast.error('Please fill out all fields')
      return
    }

    const booruType = booruTypeList.find((booruType) => booruType.type === currentBooru.value.type)

    if (!booruType) {
      toast.error('Invalid Booru type')
      return
    }

    // TODO: Validate with Domain object

    if (userBooruList.value.find((booruFromList) => booruFromList.domain === currentBooru.value.domain)) {
      toast.error('Booru already exists')
      return
    }

    // TODO: Validate with Domain object
    userBooruList.value.push({
      domain: currentBooru.value.domain,
      type: booruType,

      config: null,

      isPremium: true,
      isCustom: true
    })

    dialogOpen.value = false
  }

  function editBooru() {
    // Validations
    if (!currentBooru.value.domain || !currentBooru.value.type) {
      toast.error('Please fill out all fields')
      return
    }

    const booruType = booruTypeList.find((booruType) => booruType.type === currentBooru.value.type)

    if (!booruType) {
      toast.error('Invalid Booru type')
      return
    }

    // TODO: Validate with Domain object
    userBooruList.value[dialogEditIndex.value!] = {
      domain: currentBooru.value.domain,
      type: booruType,

      config: null,

      isPremium: true,
      isCustom: true
    }

    dialogOpen.value = false
  }

  function deleteBooru() {
    userBooruList.value.splice(dialogEditIndex.value!, 1)

    dialogOpen.value = false
  }

  useSeoMeta({
    title: 'Additional Boorus'
  })

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <main class="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Additional Boorus</template>
      <template #text> Add and edit compatible Boorus</template>
    </PageHeader>

    <section class="mx-2 mt-4 flex-auto">
      <template v-if="!userBooruList.length">
        <div class="flex h-80 w-full flex-col items-center justify-center gap-4 text-center text-lg">
          <ExclamationCircleIcon aria-hidden="true" class="h-12 w-12" />

          <h3>Start adding Boorus!</h3>

          <span class="w-full overflow-x-auto text-sm italic"> Default Boorus can't be edited </span>
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
              <span class="sr-only">Drag to reorder</span>

              <Bars2Icon aria-hidden="true" class="text-base-content group-hover:text-base-content-hover h-4 w-4" />
            </div>

            <!-- Favicon -->
            <img
              :src="`https://icons.duckduckgo.com/ip2/${booru.domain}.ico`"
              alt="Favicon"
              class="h-5 w-5 shrink-0 rounded-sm"
              height="128"
              width="128"
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
                aria-label="Edit"
                class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center rounded-md p-2"
                type="button"
                @click="openEditBooru(index)"
              >
                <PencilIcon aria-hidden="true" class="h-4 w-4" />
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
        class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center gap-2 rounded-md px-2 py-1"
        type="button"
        @click="resetUserBooruListToDefault"
      >
        <ArrowUturnLeftIcon aria-hidden="true" class="mr-2 h-4 w-4" />

        Reset
      </button>

      <!-- Add Booru -->
      <button
        class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center gap-2 rounded-md px-2 py-1"
        type="button"
        @click="openCreateBooruDialog"
      >
        Add Booru

        <PlusIcon aria-hidden="true" class="mr-2 ml-2 h-4 w-4" />
      </button>
    </section>
  </main>

  <!-- Booru Dialog -->
  <Slideover
    :is-open="dialogOpen"
    @close="dialogOpen = false"
  >
    <template #title> {{ dialogMode === 'create' ? 'Add' : 'Edit' }} Booru</template>

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
            class="text-base-content-highlight block leading-8 font-medium"
            for="domain"
          >
            Domain
          </label>

          <div class="ring-base-0/20 mt-2 flex rounded-md shadow-xs ring-1 ring-inset">
            <span class="inline-flex items-center px-3 sm:text-sm">https://</span>

            <input
              id="domain"
              v-model="currentBooru.domain"
              aria-describedby="domain-description"
              class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util border-base-0/20 bg-base-1000 flex-auto rounded-r-md px-2 py-1.5 sm:text-sm sm:leading-6"
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
            Only the domain. Not the full URL
          </p>
        </div>

        <!-- Booru Type -->
        <div>
          <label
            class="text-base-content-highlight block leading-8 font-medium"
            for="type"
          >
            Type
          </label>

          <select
            id="type"
            v-model="currentBooru.type"
            aria-describedby="type-description"
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util border-base-0/20 bg-base-1000 mt-2 block w-full rounded-md py-1.5 pr-10 pl-3 sm:text-sm sm:leading-6"
            name="type"
            required
          >
            <option
              v-for="type in booruTypeList"
              :value="type.type"
            >
              {{ type.type }}
            </option>
          </select>

          <p
            id="type-description"
            class="mt-2 text-sm"
          >
            Usually indicated in the footer (bottom) of a Booru's website

            <span class="mt-2 block text-xs italic"> If the type is equal to the domain, choose that option </span>
          </p>
        </div>
      </form>
    </div>

    <template #actions>
      <button
        v-if="dialogMode === 'update'"
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mr-auto inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1"
        type="button"
        @click="deleteBooru"
      >
        Delete
      </button>

      <!-- TODO: Test Booru functionality -->
      <!--      <button-->
      <!--        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20"-->
      <!--        type="button"-->
      <!--      >-->
      <!--        Test Booru-->
      <!--      </button>-->

      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1"
        form="booru-create-form"
        type="submit"
      >
        {{ dialogMode === 'create' ? 'Add' : 'Save' }}
      </button>
    </template>
  </Slideover>
</template>
