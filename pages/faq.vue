<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />

    <!-- Can be turned to component -->
    <div class="card-container md:w-1/2">
      <div class="post-container p-3">
        <div class="flex inline-flex align-baseline">
          <InfoIcon class="icon w-4 h-4" />
          <h1 class>
            Analytics
          </h1>
        </div>

        <div>
          <p class="text-sm">
            Analytics are included, while respecting your privacy, all
            information is anonymized and follow the `Do not track` directive,
            <a
              href="https://getinsights.io/"
              target="_blank"
              rel="noopener noreferrer"
              >check them here</a
            >!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideNav from "~/components/SideNav.vue";
import { InfoIcon } from "vue-feather-icons";

export default {
  components: { SideNav, InfoIcon }
};
</script>
