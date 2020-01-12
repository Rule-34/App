<template>
  <div class="m-5 flex flex-row justify-between">
    <!-- Domain selector -->
    <DomainSelector class="my-auto" />

    <!-- Notifications -->
    <!-- <Notifications /> -->
  </div>
</template>

<script>
import DomainSelector from '~/components/dashboard/menu/DomainSelector.vue'
// import Notifications from '~/components/dashboard/menu/Notifications'

export default {
  name: 'DashBoardMenu',
  // components: { DomainSelector, Notifications }
  components: { DomainSelector }
}
</script>
