<script lang="ts" setup>
import {HeartIcon} from '@heroicons/vue/24/solid'

const {timesTheAppHasBeenOpened} = useAppStatistics()

const open = defineModel<boolean>()
</script>

<template>
  <!-- Header -->
  <div>
    <div
      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-primary-500">
      <HeartIcon
        aria-hidden="true"
        class="h-7 w-7 text-white/70"
      />
    </div>

    <div class="mt-3 sm:mt-5">
      <!-- TODO: Podium badge visually rewarding coming back -->
      <HeadlessDialogTitle
        as="h3"
        class="text-lg text-center font-semibold leading-6 tracking-tight text-base-content-highlight"
      >
        Looks like you are enjoying the R34&nbsp;App
      </HeadlessDialogTitle>

      <div class="mt-3">

        <p>
          Since this is your <span class='bg-blue-500 px-1.5 py-0.5 rounded-full text-base-content-highlight'> {{
            timesTheAppHasBeenOpened
          }} </span>
          visit&hellip;
          <br>
          Consider supporting this project, as its maintained by a single developer that relies on your help
          to keep it running
        </p>

        <h4 class="mt-4 mb-1.5 text-base-content-highlight">
          Some ways you can help:
        </h4>

        <ol class="list-['-'] list-inside space-y-1.5">
          <li>
            <NuxtLink
              class="hover:hover-text-util underline focus-visible:focus-outline-util"
              target="_blank"
              to="/premium"
            >
              Subscribe to Premium
            </NuxtLink>
          </li>

          <li>
            <NuxtLink
              class="hover:hover-text-util underline focus-visible:focus-outline-util"
              target="_blank"
              to="https://docs.r34.app/donations"
            >
              Donate
            </NuxtLink>

            <span class='text-sm'>
              (free and paid options)
            </span>
          </li>

          <li>
            <NuxtLink
              class="hover:hover-text-util underline focus-visible:focus-outline-util"
              rel="noopener noreferrer"
              target="_blank"
              to="https://www.google.com/search?q=rule+34+app"
            >
              Google the Rule 34 App
            </NuxtLink>
            and click it
          </li>

          <li>
            Share the app&hellip;
          </li>

          <li class='ml-3'>
            <NuxtLink
              class="hover:hover-text-util underline focus-visible:focus-outline-util"
              target="_blank"
              to="https://reddit.com/submit?url=https://r34.app"
            >
              to Reddit
            </NuxtLink>
          </li>

          <li class='ml-3'>
            <NuxtLink
              class="hover:hover-text-util underline focus-visible:focus-outline-util"
              target="_blank"
              to="https://twitter.com/intent/tweet?url=https://r34.app"
            >
              to Twitter
            </NuxtLink>
          </li>

          <li class='ml-3'>
            a Discord server
          </li>

          <li class='ml-3'>
            your friends
          </li>

          <li class='ml-3'>
            anywhere you think people would enjoy it
          </li>
        </ol>

        <p class='mt-3'>

          Thank you!
          Have a great time using the app
        </p>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="mt-5 sm:mt-6">
    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-base-0/20"
      type="button"
      @click="open = false"
    >
      Dismiss
    </button>
  </div>
</template>
