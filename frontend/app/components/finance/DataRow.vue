<script setup lang="ts">

const props = defineProps<{
  label: string,
  value: any,
  formatter?: (value: any) => string
}>()

</script>

<template>
    <div className="flex justify-between py-0.5">
        <span className="text-sm text-neutral-500">{{props.label}}</span>
        <span className="font-medium text-sm">
          {{props.formatter ? props.formatter(props.value) : props.value}}
        </span>
    </div>
</template>