@@ -0,0 +1,172 @@
<template>
  <main class="h-screen flex flex-col">
    <div class="my-auto">
      <!-- Log In form -->
      <div class="material-container text-default-text p-4">
        <form action="#" method="POST">
          <label
            class="block text-lg font-medium leading-tight mb-2"
            for="license-key"
          >
            License Key
          </label>

          <div class="w-full flex items-center mt-1">
            <input
              id="license-key"
              class="appearance-none outline-none block flex-grow w-10/12 font-light bg-background border border-border rounded-md p-2 shadow-sm text-sm"
              placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
              type="text"
              name="license-key"
              required
            />

            <!-- Action -->
            <button
              type="submit"
              class="appearance-none bg-gradient-blue-lilac border-0 rounded-full ml-1 shadow-md"
            >
              <chevron-right-icon class="icon text-default w-9 h-9" />
            </button>
          </div>
        </form>
      </div>

      <!-- Separator -->
      <p class="text-default-text leading-loose text-center">Or</p>

      <!-- Subscription  -->
      <div class="material-container flex flex-col">
        <!-- Head -->
        <div class="py-10">
          <!-- Title -->
          <h3
            class="text-center text-default-text text-3xl leading-9 font-semibold"
          >
            Premium
          </h3>

          <!-- Price -->
          <div class="mt-4 flex items-center justify-center">
            <!-- Currency and cost -->
            <span
              class="px-3 flex items-start text-5xl leading-none tracking-tight text-default-text"
            >
              <span class="mt-1 mr-2 text-3xl font-medium">
                €
              </span>
              <span class="font-extrabold">
                6,9
              </span>
            </span>

            <!-- Recurring -->
            <span class="text-xl leading-8 font-medium text-default-text-muted">
              /month
            </span>
          </div>
        </div>

        <!-- Description -->
        <div
          class="flex flex-col justify-between bg-background border-t border-border p-6"
        >
          <ul>
            <!--  -->
            <li class="flex items-start">
              <div class="flex-shrink-0">
                <check-icon class="icon h-6 w-6 text-gradient-one" />
              </div>
              <p
                class="text-default-text-muted text-base font-medium leading-6 ml-3"
              >
                Add your own boorus
              </p>
            </li>

            <!--  -->
            <li class="mt-4 flex items-start">
              <div class="flex-shrink-0">
                <check-icon class="icon h-6 w-6 text-gradient-one" />
              </div>
              <p
                class="text-default-text-muted text-base font-medium leading-6 ml-3"
              >
                Save posts
              </p>
            </li>

            <!--  -->
            <li class="mt-4 flex items-start">
              <div class="flex-shrink-0">
                <check-icon class="icon h-6 w-6 text-gradient-one" />
              </div>
              <p
                class="text-default-text-muted text-base font-medium leading-6 ml-3"
              >
                Create search filters
              </p>
            </li>

            <!--  -->
            <li class="mt-4 flex items-start">
              <div class="flex-shrink-0">
                <check-icon class="icon h-6 w-6 text-gradient-one" />
              </div>
              <p
                class="text-default-text-muted text-base font-medium leading-6 ml-3"
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
                href="https://gum.co/gRuqQm"
                class="block w-full text-center border-0 rounded-lg bg-gradient-lilac-blue px-6 py-3 text-lg leading-6 font-medium text-default-text focus:outline-none focus:shadow-outline transition ease-in-out duration-150"
              >
                Subscribe
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ChevronRightIcon, CheckIcon } from 'vue-feather-icons'

export default {
  components: {
    ChevronRightIcon,
    CheckIcon,
  },

  head() {
    return {
      title: 'Premium',
      meta: [
        {
          hid: 'premium',
          name: 'description',
          content: 'Premium subscription for the Rule 34 App',
        },
      ],

      // script: [
      //   {
      //     src: 'https://gumroad.com/js/gumroad-embed.js',
      //     async: true,
      //     defer: true,
      //   },
      // ],
    }
  },
}
</script>
