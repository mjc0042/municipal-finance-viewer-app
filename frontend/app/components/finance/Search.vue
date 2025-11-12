<script setup lang="ts">
import { ref } from 'vue'

const expanded = ref(false)
const searchTerm = ref('')

function onFocus() {
  expanded.value = true
}

function onBlur() {
  expanded.value = false
}
</script>

<template>
  <div
    class="relative m-2 flex justify-center items-center p-2 bg-white rounded-xs drop-shadow-xl/25 overflow-hidden transition-[width] duration-300 ease-in-out"
    :class="{ 'w-65': expanded, 'w-10': !expanded }"
    @mouseenter="expanded = true"
    @mouseleave="expanded = false"
  >
    <Icon name="carbon:search" size="24" class="text-gray-600"/>
    <!--<svg
      class="ml-2 w-5 h-5 text-gray-600"
      fill="none" stroke="currentColor" stroke-width="2"
      viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
    </svg>-->
    <input
      v-if="expanded"
      v-model="searchTerm"
      type="text"
      placeholder="Search..."
      class="w-full outline-none bg-white caret-zinc-800 ml-2"
      @focus="onFocus"
      @blur="onBlur"
      spellcheck="false"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
    />
  </div>
</template>

<style scoped>
.search-icon svg path {
  stroke-width: 5px;
}

/* Animate width from 2.5rem (10px + icon margin) to 12rem */
</style>
