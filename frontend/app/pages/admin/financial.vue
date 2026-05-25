<script setup lang="ts">
import NavBar from '~/components/NavBar.vue';


</script>

<template>
  <div class="h-screen flex flex-col">
    <NavBar class="shrink-0"/>

    <!-- Main content -->
    <AdminMissingDataBaseTable />
  </div>
</template>

<style scoped>
</style>
