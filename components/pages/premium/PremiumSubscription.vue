<template>
  <div class="flex flex-col material-container">
    <!-- Head -->
    <div class="py-10">
      <!-- Title -->
      <h3 class="text-3xl font-semibold leading-9 text-center text-gray-200">
        Premium
      </h3>

      <!-- Price -->
      <div class="flex items-center justify-center mt-4">
        <!-- Currency and cost -->
        <span
          class="flex items-start px-3 text-5xl leading-none tracking-tight text-gray-200"
        >
          <span class="mt-1 mr-2 text-3xl font-medium"> € </span>
          <span class="font-extrabold"> 6,9 </span>
        </span>

        <!-- Recurring -->
        <span class="text-xl font-medium leading-8 text-gray-300">
          /month
        </span>
      </div>
    </div>

    <!-- Description -->
    <div
      class="flex flex-col justify-between p-6 border-t bg-darkGray-700 border-darkGray-100"
    >
      <ul>
        <!--  -->
        <li class="flex items-start">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <NuxtLink
            to="/premium/custom-boorus"
            class="ml-3 text-base font-medium leading-6 link"
          >
            Add more Boorus
          </NuxtLink>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <NuxtLink
            to="/premium/tag-collections"
            class="ml-3 text-base font-medium leading-6 link"
          >
            Create collections of Tags
          </NuxtLink>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <p class="ml-3 text-base font-medium leading-6 text-gray-300">
            <span class="line-through">Save posts</span> (WIP)
          </p>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <p class="ml-3 text-base font-medium leading-6 text-gray-300">
            Find sources with
            <a href="https://saucenao.com/" target="_blank" class="link">
              Saucenao
            </a>
          </p>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <p class="ml-3 text-base font-medium leading-6 text-gray-300">
            Support the development
          </p>
        </li>
      </ul>

      <div class="mt-8">
        <a
          target="_blank"
          href="https://gum.co/Rule34App"
          class="block w-full px-6 py-3 text-lg font-medium leading-6 text-center text-black transition border-0 rounded-lg bg-gradient-to-r from-accent-400 to-primary-400 focus:focus-util hover:text-gray-800"
        >
          Subscribe
        </a>
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
