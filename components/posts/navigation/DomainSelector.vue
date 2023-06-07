<script setup>
  import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import { PlusIcon } from '@heroicons/vue/24/solid'

  const props = defineProps({
    boorus: {
      type: Array,
      required: true
    },

    modelValue: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <Listbox
    :modelValue="modelValue"
    as="template"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <div class="relative">
      <!-- Select -->
      <ListboxButton
        class="hover:hover-text-util focus-visible:focus-util hover:hover-bg-util relative w-56 cursor-default rounded-md py-1.5 pl-3 pr-10 text-left ring-1 ring-inset ring-base-0/20 sm:text-sm sm:leading-6"
      >
        <span class="flex items-center">
          <img
            :src="`https://www.google.com/s2/favicons?domain=${modelValue.domain}&sz=128`"
            alt="Favicon"
            class="h-5 w-5 flex-shrink-0 rounded"
            height="128"
            loading="eager"
            width="128"
          />
          <span class="ml-3 block truncate">{{ modelValue.domain }}</span>
        </span>

        <!-- Chevron -->
        <span class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5" />
        </span>
      </ListboxButton>

      <!-- Menu -->
      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-10 mt-2 max-h-[23rem] w-full max-w-sm overflow-auto rounded-md bg-base-1000 py-1 ring-1 ring-base-0/20 focus:outline-none sm:text-sm"
        >
          <!-- Header -->
          <header class="relative border-b border-base-0/20 pb-1">
            <h2
              v-tooltip="
                'A Booru is a type of website imageboard that specializes in parodies of anime, manga and video game related content'
              "
              class="focus-visible:focus-util hover:hover-text-util ml-11 w-fit cursor-help underline decoration-dotted underline-offset-2"
              role="note"
              tabindex="0"
            >
              Booru
            </h2>

            <h2
              v-tooltip="
                'Score is calculated based on various factors: quantity of posts, post moderation, tag system, content variety, load speed and API compatibility'
              "
              class="focus-visible:focus-util hover:hover-text-util absolute inset-y-0 right-0 mr-4 cursor-help underline decoration-dotted underline-offset-2"
              role="note"
              tabindex="0"
            >
              Score
            </h2>
          </header>

          <!-- Options -->
          <ListboxOption
            v-for="booru in boorus"
            :key="booru.domain"
            v-slot="{ active, selected }"
            :disabled="booru.disabled"
            :value="booru"
            as="template"
          >
            <li
              :class="[
                active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content',
                booru.disabled ? 'cursor-not-allowed opacity-50' : ''
              ]"
              class="relative cursor-default select-none py-2 pl-3 pr-14"
            >
              <div class="flex items-center">
                <img
                  :src="`https://www.google.com/s2/favicons?domain=${booru.domain}&sz=128`"
                  alt="Favicon"
                  class="h-5 w-5 flex-shrink-0 rounded"
                  height="128"
                  loading="lazy"
                  width="128"
                />

                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">{{
                  booru.domain
                }}</span>

                <!-- Premium badge-->
                <span
                  v-if="booru.disabled"
                  class="ml-2 inline-flex items-center rounded-full bg-primary-800 px-2.5 py-0.5 text-xs font-medium text-primary-500"
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

                <!-- Score -->
                <span
                  :class="[
                    Math.trunc(booru.description.score) === 1
                      ? 'bg-primary-600/10 text-primary-600 ring-primary-600/20'
                      : Math.trunc(booru.description.score) === 2 || Math.trunc(booru.description.score) === 3
                      ? 'bg-primary-500/10 text-primary-500 ring-primary-500/20'
                      : Math.trunc(booru.description.score) === 4 || Math.trunc(booru.description.score) === 5
                      ? 'bg-primary-400/10 text-primary-400 ring-primary-400/20'
                      : ''
                  ]"
                  class="inline-flex items-center gap-x-1.5 rounded-full px-1.5 py-0.5 text-sm font-medium ring-1 ring-inset"
                >
                  {{ booru.description.score }}
                </span>
              </div>
            </li>
          </ListboxOption>

          <!-- Add more button -->
          <div class="hover:hover-text-util group flex items-center px-3 py-2">
            <PlusIcon
              class="group-hover:hover-text-util h-5 w-5 rounded-full p-0.5 text-base-content-highlight ring-1 ring-base-0/20"
            />

            <NuxtLink
              class="focus-visible:focus-util ml-3"
              href="/premium/boorus"
            >
              Add more Boorus
            </NuxtLink>
          </div>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
