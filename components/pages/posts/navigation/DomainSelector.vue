<script lang="ts" setup>
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import { PlusIcon } from '@heroicons/vue/24/solid'
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

  const { isPremium } = useUserData()

  function onModelValueChange(domain: Domain) {
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
</script>

<template>
  <HeadlessListbox
    :modelValue="props.modelValue"
    as="template"
    @update:modelValue="onModelValueChange"
  >
    <Float
      :offset="16"
      as="template"
      data-testid="domain-selector"
      leave="transition ease-in duration-100"
      leave-from="opacity-100"
      leave-to="opacity-0"
      placement="bottom-start"
      tailwindcss-origin-class
      vue-transition
    >
      <!-- Select -->
      <HeadlessListboxButton
        :class="[props.compact ? 'flex w-auto items-stretch !rounded-full !p-2.5' : 'w-56']"
        class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util relative cursor-default rounded-md bg-transparent py-1.5 pl-3 pr-10 text-left ring-1 ring-inset ring-base-0/20 sm:text-sm sm:leading-6"
        v-bind="$attrs"
      >
        <span class="flex items-center">
          <img
            :src="`https://icons.duckduckgo.com/ip2/${props.modelValue.domain}.ico`"
            alt="Favicon"
            class="h-5 w-5 flex-shrink-0 rounded"
            height="128"
            loading="eager"
            width="128"
          />

          <span class="sr-only"> Website to browse: </span>

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
          <ChevronUpDownIcon class="h-5 w-5" />
        </span>
      </HeadlessListboxButton>

      <!-- Menu -->
      <HeadlessListboxOptions
        class="max-h-[23rem] w-full max-w-sm overflow-auto rounded-md bg-base-1000 py-1 ring-1 ring-base-0/20 focus:outline-none sm:text-sm"
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
            class="relative cursor-default select-none py-2 pl-3 pr-14"
          >
            <div class="flex items-center">
              <img
                :src="`https://icons.duckduckgo.com/ip2/${booru.domain}.ico`"
                alt="Favicon"
                class="h-5 w-5 flex-shrink-0 rounded"
                height="128"
                loading="eager"
                width="128"
              />

              <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">{{
                booru.domain
              }}</span>

              <!-- Premium badge-->
              <span
                v-if="shouldBooruBeDisabled(booru)"
                class="ml-2 inline-flex items-center rounded-full border-2 border-primary-500/60 px-2.5 py-0.5 text-xs font-medium text-base-content-highlight"
              >
                Premium
              </span>
            </div>

            <div class="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
              <!-- Checked -->
              <span
                v-if="selected"
                class="text-base-content-highlight"
              >
                <CheckIcon class="h-5 w-5" />
              </span>
            </div>
          </li>
        </HeadlessListboxOption>

        <!-- Add more button -->
        <div class="hover:hover-text-util hover:hover-bg-util group flex items-center px-3 py-2">
          <PlusIcon class="group-hover:hover-text-util h-5 w-5 rounded" />

          <NuxtLink
            :href="isPremium ? '/premium/additional-boorus' : '/premium'"
            class="focus-visible:focus-outline-util ml-3"
          >
            Add more Boorus
          </NuxtLink>
        </div>
      </HeadlessListboxOptions>
    </Float>
  </HeadlessListbox>
</template>
