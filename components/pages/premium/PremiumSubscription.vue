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
            class="ml-3 text-base font-medium leading-6 link"
            to="/premium/custom-boorus"
          >
            Use more Boorus
          </NuxtLink>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <NuxtLink
            class="ml-3 text-base font-medium leading-6 link"
            to="/premium/tag-collections"
          >
            Create collections of Tags
          </NuxtLink>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <NuxtLink
            class="ml-3 text-base font-medium leading-6 link"
            to="/premium/saved-posts"
          >
            Save posts
          </NuxtLink>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <p class="ml-3 text-base font-medium leading-6 text-gray-300">
            Download Posts
          </p>
        </li>

        <!--  -->
        <li class="flex items-start mt-4">
          <div class="flex-shrink-0">
            <check-icon class="w-6 h-6 icon text-accent-400" />
          </div>
          <p class="ml-3 text-base font-medium leading-6 text-gray-300">
            Find source with
            <a class="link" href="https://saucenao.com/" target="_blank">
              SauceNAO
            </a>
          </p>
        </li>
      </ul>

      <div class="mt-8">
        <a
          class="block w-full px-6 py-3 text-lg font-medium leading-6 text-center text-black transition border-0 rounded-lg bg-gradient-to-r from-accent-400 to-primary-400 focus:focus-util hover:text-gray-800"
          href="https://gum.co/Rule34App"
          target="_blank"
        >
          Subscribe
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { CheckIcon } from "vue-feather-icons";

export default {
  components: {
    CheckIcon
  }
};
</script>
