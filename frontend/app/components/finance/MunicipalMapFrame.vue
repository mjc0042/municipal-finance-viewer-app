<script setup lang="ts">
import {
  ToolbarButton,
  ToolbarRoot,
  ToolbarSeparator,
} from 'reka-ui'
import { ref  } from 'vue'
import type { MunicipalFeature } from '@/types/http/gis'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { FrameType, type Frame } from '@/types/store/frames'
import type { ShowMunicipalFinancesEvent } from '@/types/events/showMunicipalFinancesEvent'

const props = defineProps<{
  frame: Frame
  municipalBoundary: MunicipalFeature
}>()

const emit = defineEmits<{
  (e: 'closeFrame', frameId:string, frameType:FrameType): void
  (e: 'addParcelData'): void
  (e: 'showFinances', event:ShowMunicipalFinancesEvent): void
  (e: 'showCharts', mid: string, municipalName:string): void
}>()

const mapRef = ref<HTMLDivElement | null>(null)
let mapInstance: L.Map | null = null
let municipalLayer: L.GeoJSON<any> | null = null

function clearLayers() {
  if (municipalLayer) {
    municipalLayer.remove()
    municipalLayer = null
  }
}

function addMunicipalLayer() {
  console.log(props.municipalBoundary)
  if (!mapInstance || !props.municipalBoundary) return
  clearLayers()

  municipalLayer = L.geoJSON(props.municipalBoundary.geometry, {
    style: () => ({
      color: '#2c3e50',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.3
    }),
  }).addTo(mapInstance)

  const bounds = municipalLayer.getBounds()
  if (bounds.isValid()) {
    mapInstance?.fitBounds(bounds.pad(0.1))
  }
}

function onShowFinances() {
  emit('showFinances', {
    mid: props.municipalBoundary.properties.mid, 
    municipalityName: props.municipalBoundary.properties.municipal_name
  })
}

function onResize(size: { width: number; height: number }) {
  if (mapInstance) {
    mapInstance.invalidateSize()
  }
}

function onClose() {
  emit('closeFrame', props.frame.id, props.frame.type ?? undefined)
}

onMounted(() => {
  nextTick(() => {
    if (mapRef.value && !mapInstance) {
      mapInstance = L.map(mapRef.value).setView([39.8283, -98.5795], 4)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      }).addTo(mapInstance);
    }
    addMunicipalLayer()
  })
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <FinanceBaseFrame
    v-bind="{ 
      frame: props.frame
    }"
    @resize="onResize"
    @closeFrame="onClose"
  >
    <template #default="{ size }">
        <div class="w-full h-full z-0">
          <div
              class="z-10"
              :style="{ width: size.width + 'px', height: size.height + 'px' }"
              ref="mapRef"
          />

          <!-- Buttons Container -->
          <div class="absolute bottom-0 left-0 mb-7 ml-2.5 flex z-20">
            <ToolbarRoot
              class="flex w-full max-w-[610px] min-w-max rounded-lg bg-white shadow-sm border-2 border-neutral-400/65 overflow-clip"
              aria-label="Formatting options"
            >
              <ToolbarButton
                class="p-4 font-semibold bg-white shrink-0 grow-0 basis-auto h-[25px] inline-flex text-md leading-none items-center justify-center outline-none cursor-pointer hover:bg-neutral-300/50 focus:relative"
                style="margin-left: auto"
                @click="$emit('addParcelData')"
              >
                Parcels
              </ToolbarButton>
              <ToolbarSeparator class="w-px bg-neutral-400/65" />
              <ToolbarButton
                class="p-4 font-semibold bg-white shrink-0 grow-0 basis-auto h-[25px] inline-flex text-md leading-none items-center justify-center outline-none cursor-pointer hover:bg-neutral-300/50 focus:relative"
                style="margin-left: auto"
                @click=onShowFinances
              >
                Finances
              </ToolbarButton>
              <ToolbarSeparator class="w-px bg-neutral-400/65" />
              <ToolbarButton
                class="p-4 font-semibold bg-white shrink-0 grow-0 basis-auto h-[25px] inline-flex text-md leading-none items-center justify-center outline-none cursor-pointer hover:bg-neutral-300/50 focus:relative"
                style="margin-left: auto"
                @click="$emit('showCharts', props.municipalBoundary.properties.mid, props.municipalBoundary.properties.municipal_name)"
              >
                Charts
              </ToolbarButton>
            </ToolbarRoot>
          </div>
        </div>
    </template>
  </FinanceBaseFrame>
</template>

<style scoped>

.municipal-frame-buttons {
  position: relative;
  bottom: 80px;
  z-index:400;
  margin-left:10px;
  margin-bottom:10px;
}

</style>
