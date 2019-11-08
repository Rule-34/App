<template>
  <div>
    <!-- TODO: hacerlos collapsibles -->
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="card-container md:w-2/3 xl:w-1/2">
      <div class="flex h-perfect p-3">
        <div
          class="material-container w-full md:w-2/3 xl:w-1/2 m-auto p-5 shadow-xl"
        >
          <div class="flex flex-wrap">
            <div class="w-2/5 m-auto text-center">
              <h1 class=" text-lg">Settings</h1>
              <button
                title="Use me when something is not working!"
                class="text-xs border rounded-full px-2 align-middle shadow"
                @click="removeLocalStorage"
              >
                Reset
              </button>
            </div>
            <div class="w-3/5 m-auto flex">
              <div class="mx-auto">
                <SettingSwitch
                  v-for="(setting, index) in userSettings"
                  :key="setting.name"
                  :value="setting.value"
                  :text="setting.name"
                  :switch-id="index"
                  :description="setting.description"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SideNav from "~/components/navigation/SideNav.vue";
import SettingSwitch from "~/components/settings/SettingSwitch.vue";

export default {
  components: { SideNav, SettingSwitch },
  computed: mapState(["userSettings"]),
  methods: {
    // Remove the localStorage object and reload the window
    removeLocalStorage() {
      localStorage.removeItem("vuex");
      location.reload();
    }
  }
};
</script>
