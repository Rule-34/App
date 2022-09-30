<template>
  <main class="max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div class="space-y-4">
      <ContentSeparator title="Backup" />

      <div class="grid grid-cols-2 place-items-center">

        <button class="flex flex-col items-center w-28 gap-2 text-gray-300 bg-gray-900 rounded-lg border-util focus:focus-util p-3"
                type="button"
                @click="createBackup">

          <SaveIcon class="w-8 h-8 icon" />

          <span class="text-md">
            Create
          </span>
        </button>

        <!-- Hidden file input -->
        <input ref="file" accept="application/json" style="display: none" type="file" @change="restoreBackup">

        <button class="flex flex-col items-center w-28 gap-2 text-gray-300 bg-gray-900 rounded-lg border-util focus:focus-util p-3"
                type="button"
                @click="$refs.file.click()">

          <RotateCcwIcon class="w-8 h-8 icon" />

          <span class="text-md">
            Restore
          </span>
        </button>
      </div>

    </div>
  </main>

</template>

<script>
import { RotateCcwIcon, SaveIcon } from "vue-feather-icons";
import { mapGetters, mapMutations } from "vuex";


export default {
  components: {
    SaveIcon,
    RotateCcwIcon
  },

  data() {
    return {};
  },

  head() {
    return {
      title: "Backup",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Backup all your App data"
        }
      ]
    };
  },

  mounted() {

    const CURRENT_URL = new URL(window.location.href);

    if (CURRENT_URL.searchParams.get("success") !== "true") {
      return;
    }

    this.$toast.error("Backup restored sucessfully");

    // Remove all query parameters
    this.$router.push({
      query: {}
    });
  },

  computed: {
    ...mapGetters(["getVersion"]),

    ...mapGetters("user", [
      "getCustomBoorus",
      "getTagCollections",
      "getSavedPosts"
    ])
  },

  methods: {
    ...mapMutations(["setVersion"]),

    ...mapMutations("user", [
      "setCustomBoorus",
      "setCustomTagCollections",
      "setSavedPosts"
    ]),

    createBackup() {

      const CURRENT_DATE_STRING = new Date().toLocaleString([], {
        timeZone: "UTC",

        hour12: false,

        second: "2-digit",
        minute: "2-digit",
        hour: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
        .replaceAll(", ", "_")
        .replaceAll("/", "-")
        .replaceAll(":", "-");

      const STATE = this.createState();


      // Create JSON file
      const BLOB = new Blob([JSON.stringify(STATE)], { type: "application/json" });

      const BLOB_OBJECT_URL = URL.createObjectURL(BLOB);


      // Create link
      const LINK = document.createElement("a");

      LINK.href = BLOB_OBJECT_URL;
      LINK.target = "_blank";
      LINK.download = `R34App_${ CURRENT_DATE_STRING }_Backup.json`;
      LINK.style.display = "none";


      // Download
      LINK.click();


      // Cleanup
      LINK.remove();
      URL.revokeObjectURL(BLOB_OBJECT_URL);

      this.$toast.error("Backup created sucessfully");
    },

    async restoreBackup() {

      const FILE = this.$refs.file.files[0];

      if (!FILE) {
        this.$toast.error("Please select a backup to restore");
        return;
      }

      const RESTORED_STATE = JSON.parse(await FILE.text());

      this.restoreState(RESTORED_STATE);

      const CURRENT_URL = new URL(window.location.href);

      CURRENT_URL.searchParams.set("success", "true");

      window.location.assign(CURRENT_URL.toString());
    },


    createState: function() {
      return {
        version: this.getVersion,

        user: {
          custom: {
            boorus: this.getCustomBoorus,
            tagCollections: this.getTagCollections,
            savedPosts: this.getSavedPosts
          }
        }
      };
    },

    restoreState: function(state) {
      // TODO: Think about what happens when an old state version is restored
      this.setVersion(state.version);

      this.setCustomBoorus(state.user.custom.boorus);
      this.setCustomTagCollections(state.user.custom.tagCollections);
      this.setSavedPosts(state.user.custom.savedPosts);
    }
  }
};
</script>
