
<template>
  <h1>{{name}}</h1>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data: function() {
    return {
      name: "Hello World!!!!"
    };
  }
});
</script>

<style>
h1 {
  color: white;
  background-color: black;
}
</style>
<style lang="scss">
$primary-color: white;
$bg: black;
h1 {
  color: $primary-color;
  background-color: $bg;
}
</style>
