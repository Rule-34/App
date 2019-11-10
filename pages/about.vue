<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="card-container md:w-2/3 xl:w-1/2">
      <div class="flex h-perfect p-3 overflow-hidden">
        <div
          class="material-container m-auto p-5 shadow-xl"
          :class="{ zoom: userSettings.zoom.value }"
        >
          <a
            href="https://akbal.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img class="mx-auto mb-5" src="/img/ALogo.png" alt="Akbal logo" />
          </a>
          <div class="text-center">
            <h1 class="btn">Alejandro Akbal</h1>
            <small>
              I'm a web developer and this PWA is a project that I do in my free
              time
            </small>
          </div>
        </div>
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
