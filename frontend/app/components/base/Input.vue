<script setup>

import { computed } from 'vue'
import { cva } from 'class-variance-authority'

// Define your CVA styles with variants
const inputBase = cva(
  'flex h-10 w-full rounded-md border border-input border-zinc-300 bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
)

// Props
const props = defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: 'text',
  },
  className: String,
})

const emit = defineEmits(['update:modelValue'])

// Compute the final class combining cva base and custom classes
const classes = computed(() => [inputBase(), props.className].filter(Boolean).join(' '))

// Emit input changes for v-model usage
function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <input
    :type="type"
    :class="classes"
    :value="modelValue"
    @input="onInput"
    v-bind="$attrs"
  />
</template>