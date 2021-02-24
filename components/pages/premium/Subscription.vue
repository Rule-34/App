<template>
  <div class="flex flex-col rounded-container">
    <!-- Head -->
    <div class="py-10">
      <!-- Title -->
      <h3
        class="text-3xl font-semibold leading-9 text-center text-default-text"
      >
        Premium
      </h3>

      <!-- Price -->
      <div class="flex items-center justify-center mt-4">
        <!-- Currency and cost -->
        <span
          class="flex items-start px-3 text-5xl leading-none tracking-tight text-default-text"
        >
          <span class="mt-1 mr-2 text-3xl font-medium"> € </span>
          <span class="font-extrabold"> 6,9 </span>
        </span>

        <!-- Recurring -->
        <span class="text-xl font-medium leading-8 text-default-text-muted">
          /month
        </span>
      </div>
    </div>

    <!-- Description -->
    <div
      class="flex flex-col justify-between p-6 border-t bg-background border-border"
    >
      <ul>
        <!--  -->
        <li class="flex items-start">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-gradient-one" />
          </div>
          <p
            class="ml-3 text-base font-medium leading-6 text-default-text-muted"
          >
            Add your own boorus
          </p>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-gradient-one" />
          </div>
          <p
            class="ml-3 text-base font-medium leading-6 text-default-text-muted"
          >
            Create Tag Collections
          </p>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-gradient-one" />
          </div>
          <p
            class="ml-3 text-base font-medium leading-6 text-default-text-muted"
          >
            <span class="line-through">Save posts</span> (WIP)
          </p>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-gradient-one" />
          </div>
          <p
            class="ml-3 text-base font-medium leading-6 text-default-text-muted"
          >
            Much more in the future
          </p>
        </li>
      </ul>

      <div class="mt-8">
        <div class="rounded-lg shadow-md">
          <a
            target="_blank"
            rel="noopener"
            :href="'https://gum.co/Rule34App'"
            class="block w-full px-6 py-3 text-lg font-medium leading-6 text-center transition duration-150 ease-in-out border-0 rounded-lg bg-gradient-lilac-blue text-default-text focus:outline-none focus:shadow-outline"
          >
            Subscribe
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CheckIcon } from 'vue-feather-icons'

export default {
  components: {
    CheckIcon,
  },
}
</script>
