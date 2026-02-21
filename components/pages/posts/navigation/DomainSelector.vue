<script lang="ts" setup>
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import { PlusIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { useFloating, offset, flip, shift } from '@floating-ui/vue'
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

    // Danbooru / Gelbooru media blocked tutorial
    const mediaBlockedDomains = ['danbooru.donmai.us', 'gelbooru.com']
    if (mediaBlockedDomains.includes(domain.domain) && !isPremium.value) {
      const { hostname } = new URL(`https://${domain.domain}`)
      const utmMedium = hostname.replace(/\./g, '-') + '-media-blocked'
      const label = hostname.charAt(0).toUpperCase() + hostname.slice(1)
      toast.info('Media blocked 😢', {
        description: `We're just as frustrated as you; ${label} has blocked us from showing images and videos. The only way we can help you see ${label} content is with Premium, which lets us securely proxy their media for you.`,
        duration: 1000 * 15, // 15 seconds
        action: {
          label: 'Proxy media',
          onClick: () => {
            window.location.href = `/premium?utm_source=internal&utm_medium=${utmMedium}`
          }
        }
      })
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

    toast.info('Domain Switcher', {
      description: 'Switch between Booru websites: each one has unique content, find the one you like the most!',
      duration: 10000
    })

    tutorialDomainSwitcher.value = true
  }
</script>

<template>
  <HeadlessListbox
    :modelValue="props.modelValue"
    as="template"
    @update:modelValue="onModelValueChange"
  >
      <!-- Select -->
      <HeadlessListboxButton
        ref="referenceEl"
        :class="[props.compact ? 'flex w-auto items-stretch rounded-full! p-2.5!' : 'w-56']"
        class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util ring-base-0/20 relative cursor-default rounded-md bg-transparent py-1.5 pr-10 pl-3 text-left ring-1 ring-inset sm:text-sm sm:leading-6"
        data-testid="domain-selector"
        v-bind="$attrs"
        @click="onDomainSelectorClick"
      >
        <span class="flex items-center">
          <img
            :src="`https://icons.duckduckgo.com/ip2/${props.modelValue.domain}.ico`"
            alt="Favicon"
            class="h-5 w-5 shrink-0 rounded-sm"
            height="128"
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
          <ChevronUpDownIcon aria-hidden="true" class="h-5 w-5" />
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
            class="bg-base-1000 ring-base-0/20 max-h-[23rem] w-full max-w-sm overflow-auto rounded-md py-1 ring-1 focus:outline-hidden sm:text-sm z-50"
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
                  :src="`https://icons.duckduckgo.com/ip2/${booru.domain}.ico`"
                  alt="Favicon"
                  class="h-5 w-5 shrink-0 rounded-sm"
                  height="128"
                  width="128"
                />

                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">{{
                  booru.domain
                }}</span>

                <!-- Premium badge-->
                <span
                  v-if="shouldBooruBeDisabled(booru)"
                  class="border-primary-500/60 text-base-content-highlight ml-2 inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-medium"
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
                  <CheckIcon aria-hidden="true" class="h-5 w-5" />
                </span>
              </div>
            </li>
          </HeadlessListboxOption>

          <!-- Add more button -->
          <div class="hover:hover-text-util hover:hover-bg-util group flex items-center px-3 py-2">
            <PlusIcon aria-hidden="true" class="group-hover:hover-text-util h-5 w-5 rounded-sm" />

            <NuxtLink
              :href="isPremium ? '/premium/additional-boorus' : '/premium'"
              class="focus-visible:focus-outline-util ml-3"
            >
              Add more Boorus
            </NuxtLink>
          </div>
          </HeadlessListboxOptions>
        </Transition>
      </Teleport>
  </HeadlessListbox>
</template>
