<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="container md:w-2/3 xl:w-1/2">
      <div class="flex h-perfect p-3 overflow-hidden">
        <a
          href="https://akbal.dev/"
          target="_blank"
          rel="noopener noreferrer"
          class="material-container m-auto p-5 shadow-xl"
          :class="{ zoom: userSettings.zoom.value }"
        >
          <div>
            <img class="mx-auto mb-5" src="/img/ALogo.png" alt="Akbal logo" />

            <h1
              class="py-1 px-3 border rounded-full w-fit-content mx-auto bg-gray-900 text-gray-300 shadow-md mb-1"
            >
              Alejandro Akbal
            </h1>
            <small class="text-black">
              I'm a web developer and this PWA is a project that I do in my free
              time
            </small>
          </div>
        </a>
      </div>

      <!-- Donation -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SideNav from "~/components/navigation/SideNav.vue";

export default {
  components: { SideNav },
  computed: mapState(["userSettings"])
};
</script>
