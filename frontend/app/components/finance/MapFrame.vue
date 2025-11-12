<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { StateBoundary, MunicipalFeature, MunicipalBoundaryCollection } from '@/types/http/gis'
import { useFinanceStore } from '@/stores/finance'
import { useFramesStore } from '@/stores/frames'
import 'leaflet/dist/leaflet.css'
import L, { map } from 'leaflet'
import type { SelectMunicipalityEvent } from '@/types/events/selectMunicipalityEvent'
import { FrameType, type Frame } from '@/types/store/frames'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ 
    frame: Frame,
    stateBoundaries: StateBoundary[] | undefined
}>()

const emit = defineEmits<{
  (e: 'closeFrame', frameId:string, frameType:FrameType ): void
  (e: 'selectState', feature: StateBoundary): void
  (e: 'selectMunicipality', event: SelectMunicipalityEvent): void
}>()

const financeStore = useFinanceStore()
const selectedState = computed(() => {
  return financeStore.getSelectedState(props.frame.id)
})
const frameInfo = computed(() => {
  let info = props.frame
  info.title = selectedState.value ? selectedState.value.name : props.frame.title
  info.type = selectedState.value ? FrameType.MapState : props.frame.type
  return info
})

// Toggling state and municipality boundary view
const stateBoundaryView = ref(true)
const municipalBoundaryView = ref(false)

function toggleBoundaryView(sView:boolean, mView:boolean) {
  stateBoundaryView.value = sView
  municipalBoundaryView.value = mView
}

// -------------- Leaflet features ------------------------
const mapRef = ref<HTMLDivElement | null>(null)
let mapInstance: L.Map | null = null

let stateLayers: L.GeoJSON<any>[] = []
let municipalLayer: L.GeoJSON<any> | null = null

function clearLayers() {
  if (stateLayers) {
    stateLayers.forEach(layer => {
      layer.remove()
    })
    stateLayers = []
  }
  if (municipalLayer) {
    municipalLayer.remove()
    municipalLayer = null
  }
}

function addStateLayer() {
  if (!mapInstance || !props.stateBoundaries) return

  clearLayers()
  
  props.stateBoundaries.forEach((boundary) => {
    if (!boundary.geometry) return;

    const layer = L.geoJSON(boundary.geometry, {
      style: () => ({
        color: '#2c3e50',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.3
      })
    });

    layer.on('click', () => {
      // Switch to municipal boundaries
      toggleBoundaryView(false, true)
      emit('selectState', boundary)
      financeStore.setSelectedState(
        props.frame.id,
        boundary.properties.name,
        boundary.properties.stusps,
        boundary.properties.statefp)
      useFramesStore().updateFrameData(props.frame.id,
        {title: boundary.properties.name, type: FrameType.MapState})
      addMunicipalLayer()
    })
    stateLayers.push(layer);
  });



  // --- Fit to all polygons
  if (stateLayers.length > 0) {
    // Collect all bounds and combine
    const group = L.featureGroup(stateLayers);
    group.addTo(mapInstance)
    const bounds = group.getBounds()
    if (bounds.isValid()) {
      mapInstance?.fitBounds(bounds.pad(0.1));
    }
  }
}

function addMunicipalLayer() {
  if (!selectedState.value) return

  const municipalBoundaries = financeStore.getStateMunicipalBoundariesList(selectedState.value.code)
  if (!mapInstance || !municipalBoundaries) return
  clearLayers()

  municipalLayer = L.geoJSON(municipalBoundaries, {
    style: () => ({
      color: '#2c3e50',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.3
    }),
    onEachFeature: (feature: MunicipalFeature, layer: any) => {
      layer.on('click', () => {
        if (selectedState.value) {
          emit('selectMunicipality', { 
            municipalityName: feature.properties.municipal_name,
            stateInfo: selectedState.value,
            featureId: feature.id,
            mid: feature.properties.mid
          })
        }
      })
    }
  }).addTo(mapInstance)

  const bounds = municipalLayer.getBounds()
  if (bounds.isValid()) {
    mapInstance?.fitBounds(bounds.pad(0.1))
  }
}

function onResize(size: { width: number; height: number }) {
  if (mapInstance) {
    mapInstance.invalidateSize()
  }
}

function onClose() {
  emit('closeFrame', props.frame.id, frameInfo.value.type ?? undefined)
}

onMounted(() => {
  nextTick(() => {
    if (mapRef.value && !mapInstance) {
      mapInstance = L.map(mapRef.value).setView([39.8283, -98.5795], 4)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      }).addTo(mapInstance);
      /*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance)*/
      // Default to state layer on mount
      addStateLayer()
    }
  })
})

watch(
  () => {
    if (!selectedState.value) {
      addStateLayer()
      return
    }
    return financeStore.getStateMunicipalBoundariesList(selectedState.value.code)
  },
  (newVal) => {
    if (newVal && !stateBoundaryView.value) {
      addMunicipalLayer()
    }
  }
)

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
      frame: frameInfo
    }"
    @resize="onResize"
    @closeFrame="onClose"
  >
    <template #default="{ size }">
        <div class="w-full h-full">
            <div
                :style="{ width: size.width + 'px', height: size.height + 'px' }"
                ref="mapRef"
            />
        </div>
    </template>
  </FinanceBaseFrame>
</template>

<style scoped>

</style>
