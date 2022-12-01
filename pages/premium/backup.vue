<template>
  <main class='mx-auto min-h-screen max-w-3xl p-4 sm:p-6 lg:p-8'>
    <div class='space-y-4'>
      <ContentSeparator title='Backup' />

      <div class='grid grid-cols-2 place-items-center'>
        <button
          class='border-util focus-visible:focus-util flex w-28 flex-col items-center gap-2 rounded-lg bg-gray-900 p-3 text-gray-300'
          type='button'
          @click='createBackup'
        >
          <SaveIcon class='icon h-8 w-8' />

          <span class='text-md'> Create </span>
        </button>

        <!-- Hidden file input -->
        <input
          ref='file'
          accept='application/json'
          style='display: none'
          type='file'
          @change='restoreBackup'
        />

        <button
          class='border-util focus-visible:focus-util flex w-28 flex-col items-center gap-2 rounded-lg bg-gray-900 p-3 text-gray-300'
          type='button'
          @click='$refs.file.click()'
        >
          <RotateCcwIcon class='icon h-8 w-8' />

          <span class='text-md'> Restore </span>
        </button>
      </div>
    </div>
  </main>
</template>

<script>
  import { RotateCcwIcon, SaveIcon } from 'vue-feather-icons'
  import { createStateFromStore, restoreStateToStore } from '~/assets/js/StateHelper'

  export default {
    components: {
      SaveIcon,
      RotateCcwIcon
    },

    data() {
      return {}
    },

    head() {
      return {
        title: 'Backup',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Backup all your App data'
          }
        ]
      }
    },

    methods: {
      createBackup() {
        const CURRENT_DATE_STRING = new Date()
          .toLocaleString([], {
            timeZone: 'UTC',

            hour12: false,

            second: '2-digit',
            minute: '2-digit',
            hour: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
          .replaceAll(', ', '_')
          .replaceAll('/', '-')
          .replaceAll(':', '-')

        const STATE = createStateFromStore(this.$store)

        // Create JSON file
        const BLOB = new Blob([JSON.stringify(STATE)], {
          type: 'application/json'
        })

        const BLOB_OBJECT_URL = URL.createObjectURL(BLOB)

        // Create link
        const LINK = document.createElement('a')

        LINK.href = BLOB_OBJECT_URL
        LINK.target = '_blank'
        LINK.download = `R34App_${ CURRENT_DATE_STRING }_Backup.json`
        LINK.style.display = 'none'

        // Download
        LINK.click()

        // Cleanup
        LINK.remove()
        URL.revokeObjectURL(BLOB_OBJECT_URL)

        this.$toast.info('Backup created sucessfully')
      },

      async restoreBackup() {
        const FILE = this.$refs.file.files[0]

        if (!FILE) {
          this.$toast.error('Please select a backup to restore')
          return
        }

        const RESTORED_STATE = JSON.parse(await FILE.text())

        restoreStateToStore(RESTORED_STATE, this.$store)

        this.$toast.info('Backup restored sucessfully')
      }
    }
  }
</script>
