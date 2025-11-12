<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFramesStore } from '@/stores/frames'
import type { Frame } from '@/types/store/frames'

const props = defineProps<{ frame: Frame }>()
const emit = defineEmits(['minimize', 'closeFrame', 'move', 'resize'])

const framesStore = useFramesStore()

const frameTitle = computed(() => {
  return framesStore.getFrameTitle(props.frame.id) ?? props.frame.title
})

const isMinimized = ref(props.frame.minimized ?? false)
const pos = ref(props.frame.position ?? { x: 150, y: 150 })
const size = ref(props.frame.size ?? { width: 600, height: 600 })

// Default Header Height
const defaultHeaderHeight = 35
const headerHeight = ref(defaultHeaderHeight)

onMounted(() => {
  const headerEl = document.getElementById(`${props.frame.id}-fheader`)
  if (headerEl) {
    headerHeight.value = headerEl.getBoundingClientRect().height
  }
})
// 
const contentSize = computed(() => {
  return {
    width: size.value.width,
    height: size.value.height - headerHeight.value
  }
})

// ------------------- Resizing ---------------------------------
let resizing = false
let resizeDir = ''
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let startLeft = 0
let startTop = 0

function startResize(dir: string, e: MouseEvent) {
  e.preventDefault()
  resizing = true
  resizeDir = dir
  startX = e.clientX
  startY = e.clientY
  startWidth = size.value.width
  startHeight = size.value.height
  startLeft = pos.value.x
  startTop = pos.value.y
  window.addEventListener('mousemove', resizingHandler)
  window.addEventListener('mouseup', stopResize)
}

function resizingHandler(e: MouseEvent) {
  if(!resizing) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if(resizeDir.includes('r')) size.value.width = Math.max(300, startWidth + dx)
  if(resizeDir.includes('l')) {
    const newWidth = Math.max(300, startWidth - dx)
    size.value.width = newWidth
    pos.value.x = startLeft + dx // move left edge when resizing left
  }
  if(resizeDir.includes('b')) size.value.height = Math.max(300, startHeight + dy)
  if(resizeDir.includes('t')) {
    const newHeight = Math.max(300, startHeight - dy)
    size.value.height = newHeight
    pos.value.y = startTop + dy
  }
  emit('resize', { width: size.value.width, height: size.value.height })
}

function stopResize() {
  resizing = false
  window.removeEventListener('mousemove', resizingHandler)
  window.removeEventListener('mouseup', stopResize)
  framesStore.updateFrameSize(props.frame.id, { width: size.value.width, height: size.value.height })
}

// ------------------ Dragging -------------------------
const startDrag = ref(false)
let offsetX = 0, offsetY = 0
function onMouseDown(e: MouseEvent) {
  startDrag.value = true
  offsetX = e.clientX - pos.value.x
  offsetY = e.clientY - pos.value.y
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
function onMouseMove(e: MouseEvent) {
  if (startDrag.value) {
    pos.value.x = e.clientX - offsetX
    pos.value.y = e.clientY - offsetY
    emit('move', { x: pos.value.x, y: pos.value.y })
  }
}

function onMouseUp() {
  startDrag.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  framesStore.updateFramePosition(props.frame.id, {x: pos.value.x, y: pos.value.y})
}

function bringToFront() {
  if (!props.frame.minimized) {
    framesStore.bringFrameToFront(props.frame.id)
  }
}

// ------------------ Minimizing / Maximizing --------------------
function minimize() {
  isMinimized.value = true
  emit('minimize')
  framesStore.minimizeFrame(props.frame.id)
}
function onMaximize() {
  isMinimized.value = false
  framesStore.maximizeFrame(props.frame.id)
}
function closeFrame() {
  emit('closeFrame')
  framesStore.closeFrame(props.frame.id)
}
</script>



<template>
  <div :id="`frame-${props.frame.id}`" class="resize inline-block absolute" @mousedown="bringToFront">
    <div v-show="!isMinimized"
      :style="{
        left: pos.x + 'px',
        top: pos.y + 'px',
        position: 'fixed',
        width: size.width + 'px',
        height: size.height + 'px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: props.frame.zIndex || 100
      }"
      class="bg-neutral-800 flex flex-col"
    >
      <!-- Edges & Corners (for resizing)-->
      <div class="resize-handle resize-handle-t" @mousedown="startResize('t', $event)" />
      <div class="resize-handle resize-handle-r" @mousedown="startResize('r', $event)" />
      <div class="resize-handle resize-handle-b" @mousedown="startResize('b', $event)" />
      <div class="resize-handle resize-handle-l" @mousedown="startResize('l', $event)" />
      <div class="resize-handle resize-corner resize-handle-tr" @mousedown="startResize('tr', $event)" />
      <div class="resize-handle resize-corner resize-handle-br" @mousedown="startResize('br', $event)" />
      <div class="resize-handle resize-corner resize-handle-bl" @mousedown="startResize('bl', $event)" />
      <div class="resize-handle resize-corner resize-handle-tl" @mousedown="startResize('tl', $event)" />
      <!-- Frame Header -->
      <div :id="`${props.frame.id}-fheader`"
        class="flex items-center justify-between p-1 pl-2 bg-neutral-900 text-white cursor-move"
        :style="{ height: defaultHeaderHeight + 'px' }"
        @mousedown.prevent="onMouseDown">
        <div>{{ frameTitle }}</div>
        <div class="flex space-x-2">
          <button @click="minimize" title="Minimize" class="hover:bg-zinc-800 px-2 rounded cursor-pointer">
            <Icon name="carbon:minimize" class="w-5 h-5" /></button>
          <button @click="closeFrame" title="Close" class="hover:bg-zinc-800 px-2 rounded cursor-pointer">
            <Icon name="carbon:close" class="w-5 h-5" />
          </button>
        </div>
      </div>
      <!-- Frame Content -->
      <div :style="{ width: contentSize.width + 'px', height: contentSize.height + 'px' }">
        <slot :size="contentSize"/>
      </div>
    </div>
    <!-- Frame Tray -->
    <FinanceFrameTray 
      v-show="isMinimized" 
      :id="`${props.frame.id}`"
      :title="`${frameTitle}`"
      @maximize="onMaximize"
      @closeFrame="closeFrame" />

  </div>
</template>

<style scoped>
.resize-handle {
  position: absolute;
  z-index: 1000;
}

.resize-corner {
  width: 5px;
  height: 5px;
  opacity: 0%;
}

.resize-handle-t {
  top: 0;
  cursor: n-resize;
  width: 100%;
  height: 5px;
  opacity: 0%;
  margin-top: -3px;
}
.resize-handle-tr {
  top: 0;
  right: 0;
  cursor: ne-resize;
  margin-top: -3px;
  margin-right: -3px;
}

.resize-handle-r {
  top: 0;
  right: 0;
  cursor: e-resize;
  width: 5px;
  height: 100%;
  opacity: 0%;
  margin-right: -3px;
}

.resize-handle-br {
  bottom: 0;
  right: 0;
  cursor: se-resize;
  margin-bottom: -3px;
  margin-right: -3px;
}

.resize-handle-b {
  bottom: 0;
  cursor: s-resize;
  width: 100%;
  height: 5px;
  opacity: 0%;
  margin-bottom: -3px;
}

.resize-handle-bl {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
  margin-bottom: -3px;
  margin-left: -3px;
}

.resize-handle-l {
  top: 0;
  left: 0;
  cursor: w-resize;
  width: 5px;
  height: 100%;
  opacity: 0%;
  margin-left: -3px;
}

.resize-handle-tl {
  top: 0;
  left: 0;
  cursor: nw-resize;
  margin-top: -3px;
  margin-left: -3px;
}
</style>
