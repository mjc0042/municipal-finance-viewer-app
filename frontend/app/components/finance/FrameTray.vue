<script setup lang="ts">
import { useFramesStore } from '@/stores/frames'

const props = defineProps<{
    id: string,
    title: string,
}>()
const emit = defineEmits(['maximize', 'closeFrame'])

const framesStore = useFramesStore()

const trayWidth = 100 // Width of each tray in pixels
const traySpacing = 20 // Spacing between trays in pixels

function maximize() {
  emit('maximize')
}
function closeFrame() {
    emit('closeFrame')
}

function getTrayPosition() {
  const frame = framesStore.frames.find(f => f.id === props.id)
  const index = frame?.trayIndex ?? 0
  return 16 + ((index - 1) * (trayWidth)) + ((index-1) * traySpacing) // 16px initial left margin
}

</script>

<template>
    <div :id="`tray-${props.id}`" 
        :style="{ left: getTrayPosition()+ 'px'}"
        class="finance-tray-item fixed bottom-6 rounded-2 shadow px-3 py-1 flex items-center space-x-2 bg-neutral-900">
        <span class="cursor-default text-gray-300 pr-5">{{ props.title }}</span>
        <button @click="maximize" class="rounded text-gray-300 cursor-pointer hover:bg-zinc-800">
        <Icon name="carbon:maximize" class="w-5 h-5" />
        </button>
        <button @click="closeFrame" class="rounded text-gray-300 cursor-pointer hover:bg-zinc-800">
        <Icon name="carbon:close" class="w-5 h-5" />
        </button>
    </div>
</template>

<style scoped>

.finance-tray-item {
  width: 100; /* Same as trayWidth */
  transition: left 0.2s ease;
}

</style>