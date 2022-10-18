<template>
  <!-- Side Nav Toggler -->
  <aside class="navigation-toggler fixed z-50">
    <div class="flex flex-col items-center justify-center">
      <SideNavToggler />

      <div class="my-2" />

      <!-- Portal -->
      <portal-target name="side-nav-area" />
    </div>
  </aside>
</template>

<script>
export default {}
</script>

<style lang="postcss">
.navigation-toggler {
  @apply transition-transform duration-300;

  top: 7vh;
  transform: translateX(-50%);
}

.navigation-toggler:hover {
  transform: translateX(1vw);
}

@screen md {
  .navigation-toggler {
    transform: translateX(1vw);
  }
}
</style>
