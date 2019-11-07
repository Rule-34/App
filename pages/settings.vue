<template>
  <div>
    <!-- TODO: hacerlos collapsibles -->
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="card-container md:w-2/3 xl:w-1/2">
      <h1>Settings</h1>
      <div>
        <SettingSwitch
          v-for="(setting, index) in userSettings"
          :key="setting.name"
          :value="setting.value"
          :text="setting.name"
          :switch-id="index"
        />
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
  computed: mapState(["userSettings"])
};
</script>
