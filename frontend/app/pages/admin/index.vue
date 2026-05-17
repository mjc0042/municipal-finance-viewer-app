<script setup lang="ts">
import NavBar from '~/components/NavBar.vue';


</script>

<template>
  <div class="h-screen flex flex-col">
    <NavBar class="shrink-0"/>

    <!-- Main content -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <NuxtLink to="/admin/financial" class="flex flex-col items-center border border-gray-200 shadow shadow-black/10 rounded md:flex-row">
        <img class="object-cover w-full rounded-base h-64 md:h-auto md:w-48 md:mb-0" src="" alt="">
        <div class="flex flex-col justify-between md:p-4 leading-normal">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-heading">Admin Finances</h5>
            <ul class="mb-6 text-body">
              <li><p>Add Municipality Data</p></li>
              <li><p>Access Missing Data</p></li>
            </ul>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
</style>