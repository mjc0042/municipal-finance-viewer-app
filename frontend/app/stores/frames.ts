// stores/framesStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Frame } from '@/types/store/frames'

export const useFramesStore = defineStore('framesStore', () => {
  const trayCount = ref<number>(0)
  const maxZIndex = ref<number>(100)
  const frames = ref<Frame[]>([])

  function addFrame(frame: Frame) {
    console.log("Adding frame:", frame.id)
    maxZIndex.value += 1
    frame.zIndex = maxZIndex.value
    frames.value.push(frame)
  }

  function updateFrameData(id: string, updatedData: Partial<Frame>) {
    const frame = frames.value.find(f => f.id === id)
    if (frame) {
      Object.assign(frame, updatedData)
    }
  }

  function getFrameTitle(id: string): string | undefined {
    const frame = frames.value.find(f => f.id === id)
    return frame?.title
  }

  function closeFrame(id: string) {
    console.log("Closing frame:", id)
    const frame = frames.value.find(f => f.id === id)
    if (frame?.minimized) {
      trayCount.value -= 1
    }
    frames.value = frames.value.filter(f => f.id !== id)
    // Reindex remaining trays
    frames.value
      .filter(f => f.minimized)
      .forEach((f, idx) => f.trayIndex = idx + 1)
  }

  function minimizeFrame(id: string) {
    const frame = frames.value.find(f => f.id === id)
    if (frame) {
      frame.minimized = true
      trayCount.value += 1
      frame.trayIndex = trayCount.value
    }
  }

  function maximizeFrame(id: string) {
    const frame = frames.value.find(f => f.id === id)
    if (frame) {
      frame.minimized = false
      trayCount.value -= 1
      frame.trayIndex = undefined
      // Reindex remaining trays
      frames.value
        .filter(f => f.minimized)
        .forEach((f, idx) => f.trayIndex = idx + 1)
    }
  }

  function updateFramePosition(id: string, position: { x: number; y: number }) {
    const frame = frames.value.find(f => f.id === id)
    if (frame) frame.position = position
  }

  function updateFrameSize(id: string, size: { width: number; height: number }) {
    const frame = frames.value.find(f => f.id === id)
    if (frame) frame.size = size
  }

  function bringFrameToFront(id: string) {
    maxZIndex.value += 1
    const frame = frames.value.find(f => f.id === id)
    if (frame) {
      frame.zIndex = maxZIndex.value
    }
  }

  return {
    frames,
    maxZIndex,
    trayCount,
    addFrame,
    updateFrameData,
    getFrameTitle,
    closeFrame,
    minimizeFrame,
    maximizeFrame,
    updateFramePosition,
    updateFrameSize,
    bringFrameToFront,
  }
}, {
  persist: {
    storage: piniaPluginPersistedstate.sessionStorage()
  }
})
