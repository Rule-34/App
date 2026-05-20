<script lang="ts" setup>
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import { PlusIcon } from '@heroicons/vue/24/solid'
  import { flip, offset, shift, useFloating } from '@floating-ui/vue'
  import type { Domain } from '~/assets/js/domain'

  defineOptions({
    inheritAttrs: false
  })

  interface DomainSelectorProps {
    boorus: Domain[]
    modelValue: Domain

    compact?: boolean
  }

  const props = defineProps<DomainSelectorProps>()

  const emit = defineEmits(['update:modelValue'])

  const { t } = useI18n()
  const { toast } = useLazyToast()
  const localePath = useLocalePath()
  const { isPremium } = useUserData()
  const { tutorialDomainSwitcher } = useAppStatistics()

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  const { floatingStyles } = useFloating(referenceEl, floatingEl, {
    placement: 'bottom-start',
    middleware: [offset(16), flip(), shift()]
  })

  function onModelValueChange(domain: Domain) {
    // Premium prompt
    if (domain.isPremium && !isPremium.value) {
      const { open: promptPremium, currentIndex } = usePremiumDialog()

      currentIndex.value = 4
      promptPremium.value = true
      return
    }

    emit('update:modelValue', domain)
  }

  function shouldBooruBeDisabled(booru: Domain) {
    if (booru.isPremium && !isPremium.value) {
      return true
    }

    return false
  }

  function onDomainSelectorClick() {
    if (tutorialDomainSwitcher.value) {
      return
    }

    toast.info(t('toasts.domainSwitcher'), {
      description: t('toasts.domainSwitcherDescription'),
      duration: 10000
    })

    tutorialDomainSwitcher.value = true
  }
</script>

<template>
  <HeadlessListbox
    :model-value="props.modelValue"
    as="template"
    @update:model-value="onModelValueChange"
  >
    <!-- Select -->
    <HeadlessListboxButton
      ref="referenceEl"
      :class="[props.compact ? 'flex w-auto items-stretch rounded-full! p-2.5!' : 'w-56']"
      class="relative cursor-default rounded-md bg-transparent py-1.5 pr-10 pl-3 text-left ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm sm:leading-6"
      data-testid="domain-selector"
      v-bind="$attrs"
      @click="onDomainSelectorClick"
    >
      <span class="flex items-center">
        <img
          :alt="t('common.favicon')"
          :src="useFaviconUrl(props.modelValue.domain)"
          class="h-5 w-5 shrink-0 rounded-sm"
          height="64"
          width="64"
        />

        <span class="sr-only"> {{ t('common.websiteToBrowse') }} </span>

        <span
          v-if="!props.compact"
          class="ml-3 block truncate"
          >{{ props.modelValue.domain }}</span
        >
      </span>

      <!-- Chevron -->
      <span
        v-if="!props.compact"
        class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
      >
        <ChevronUpDownIcon
          aria-hidden="true"
          class="h-5 w-5"
        />
      </span>
    </HeadlessListboxButton>

    <!-- Menu -->
    <Teleport to="body">
      <Transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <HeadlessListboxOptions
          ref="floatingEl"
          :style="floatingStyles"
          class="z-50 max-h-[23rem] w-full max-w-sm overflow-auto rounded-md bg-base-1000 py-1 ring-1 ring-base-0/20 focus:outline-hidden sm:text-sm"
        >
          <!-- Options -->
          <HeadlessListboxOption
            v-for="booru in props.boorus"
            :key="booru.domain"
            v-slot="{ active, selected }"
            :value="booru"
            as="template"
          >
            <li
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="relative cursor-default py-2 pr-14 pl-3 select-none"
            >
              <div class="flex items-center">
                <img
                  :alt="t('common.favicon')"
                  :src="useFaviconUrl(booru.domain)"
                  class="h-5 w-5 shrink-0 rounded-sm"
                  height="64"
                  width="64"
                />

                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">{{
                  booru.domain
                }}</span>

                <!-- Premium badge-->
                <span
                  v-if="shouldBooruBeDisabled(booru)"
                  class="ml-2 inline-flex items-center rounded-full border-2 border-primary-500/60 px-2.5 py-0.5 text-xs font-medium text-base-content-highlight"
                >
                  {{ t('common.premium') }}
                </span>
              </div>

              <div class="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
                <!-- Checked -->
                <span
                  v-if="selected"
                  class="text-base-content-highlight"
                >
                  <CheckIcon
                    aria-hidden="true"
                    class="h-5 w-5"
                  />
                </span>
              </div>
            </li>
          </HeadlessListboxOption>

          <!-- Add more button -->
          <div class="group flex items-center px-3 py-2 hover:hover-bg-util hover:hover-text-util">
            <PlusIcon
              aria-hidden="true"
              class="h-5 w-5 rounded-sm group-hover:hover-text-util"
            />

            <NuxtLink
              :href="localePath(isPremium ? '/premium/additional-boorus' : '/premium')"
              class="ml-3 focus-visible:focus-outline-util"
            >
              {{ t('pages.premium.addMoreBoorus') }}
            </NuxtLink>
          </div>
        </HeadlessListboxOptions>
      </Transition>
    </Teleport>
  </HeadlessListbox>
</template>
