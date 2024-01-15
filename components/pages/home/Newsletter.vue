<script lang="ts" setup></script>

<template>
  <div
    class="relative isolate overflow-hidden bg-transparent px-6 pb-12 pt-16 shadow-2xl sm:rounded-3xl sm:px-24 sm:py-28"
  >
    <h2 class="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-base-content-highlight sm:text-4xl">
      Premium Giveaway
    </h2>

    <p class="mx-auto mt-2 max-w-xl text-center text-lg leading-8">
      Get notified about new features and future giveaways by subscribing to our newsletter
    </p>

    <form
      action="https://mail.akbal.dev/subscribe/a97031df-b6c5-47f3-8c09-1d373fcc907d"
      class="mx-auto mt-10 flex max-w-md gap-x-4"
      method="post"
    >
      <label
        class="sr-only"
        for="email-address"
        >Email address</label
      >

      <input
        id="email-address"
        autocomplete="email"
        class="focus-visible:focus-outline-util min-w-0 flex-auto rounded-md border-0 bg-base-0/10 px-3.5 py-2 text-base-content-highlight ring-1 ring-inset ring-base-0/10 sm:text-sm sm:leading-6"
        name="email"
        placeholder="Enter your email"
        required=""
        type="email"
      />

      <!-- Honeypot -->
      <div style="position: absolute; left: -9999px">
        <label for="name">Your name</label>
        <input
          id="name"
          autocomplete="nope"
          name="name"
          tabindex="-1"
          type="text"
        />
      </div>

      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util flex-none rounded-md bg-base-1000 px-3.5 py-2.5 text-sm font-medium ring-1 ring-base-0/20"
        type="submit"
      >
        Notify me
      </button>

      <!-- TODO: Add this text -->
      <!-- No spam. Unsubscribe anytime. -->
    </form>

    <!-- Background -->
    <svg
      aria-hidden="true"
      class="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2"
      viewBox="0 0 1024 1024"
    >
      <circle
        cx="512"
        cy="512"
        fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
        fill-opacity="0.7"
        r="512"
      />
      <defs>
        <radialGradient
          id="759c1415-0410-454c-8f7c-9a820de03641"
          cx="0"
          cy="0"
          gradientTransform="translate(512 512) rotate(90) scale(512)"
          gradientUnits="userSpaceOnUse"
          r="1"
        >
          <stop stop-color="#7775D6" />
          <stop
            offset="1"
            stop-color="#E935C1"
            stop-opacity="0"
          />
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>
