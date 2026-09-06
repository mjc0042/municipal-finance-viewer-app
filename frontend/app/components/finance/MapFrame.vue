<script setup lang="ts">
import chroma from 'chroma-js'
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ToolbarButton, ToolbarRoot, ToolbarSeparator } from 'reka-ui'
import type { StateBoundary, MunicipalFeature, MunicipalBoundaryCollection } from '@/types/http/gis'
import type { CompareResult, YearMode } from '@/types/http/finance'
import { useFinanceStore } from '@/stores/finance'
import { useFramesStore } from '@/stores/frames'
import { financialApi } from '@/composables/api/financialApi'
import { getNumberFields } from '~/composables/finance/calculationUtils'
import CalculationsModal from './CalculationsModal.vue'
import type { CalculationItem } from './CalculationsModal.vue'
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

// -------------- Comparison state (component-local) ------------------------
const showCompareModal = ref(false)
const currentCalculation = ref<CalculationItem[]>([])
const currentYearMode = ref<YearMode>('latest')
const activeComparison = ref<CompareResult[]>([])
const compareMessage = ref('')
const showCompareMessage = ref(false)
const financesFieldsCache = ref<string[] | null>(null)

const defaultBoundaryStyle = {
  color: '#2c3e50',
  weight: 1.5,
  opacity: 1,
  fillOpacity: 0.3
}

const toolbarButtonClass = 'p-4 font-semibold bg-white shrink-0 grow-0 basis-auto h-[25px] inline-flex text-md leading-none items-center justify-center outline-none cursor-pointer hover:bg-neutral-300/50 focus:relative'

const compareFieldList = computed(() => {
  const municipalBoundaries = selectedState.value
    ? financeStore.getStateMunicipalBoundariesList(selectedState.value.code)
    : []
  return {
    'Municipal Finances': { source: 'finances', fields: financesFieldsCache.value ?? [] },
    'Municipality': { source: 'municipality', fields: getNumberFields(municipalBoundaries[0]?.properties) }
  }
})

async function onOpenCompare() {
  if (!selectedState.value) return

  // Derive finance field list from one municipality's finances, cached per session.
  // Finances are held in the store's existing finances cache keyed by mid - no
  // extra frame bookkeeping is written.
  if (!financesFieldsCache.value) {
    const municipalBoundaries = financeStore.getStateMunicipalBoundariesList(selectedState.value.code)
    const firstWithMid = municipalBoundaries.find(f => f.properties.mid)
    if (firstWithMid?.properties.mid) {
      await financeStore.fetchMunicipalityFinances(firstWithMid.properties.mid)
      const finances = financeStore.getMunicipalFinancesByMid(firstWithMid.properties.mid)
      const fields = finances && finances.length > 0 ? getNumberFields(finances[0]) : null
      if (fields && fields.length > 0) {
        financesFieldsCache.value = fields
      } else {
        showCompareError('Unable to derive available finance fields')
        return
      }
    } else {
      showCompareError('No finance data available for this state')
      return
    }
  }

  showCompareModal.value = true
}

function showCompareError(msg: string) {
  compareMessage.value = msg
  showCompareMessage.value = true
  setTimeout(() => showCompareMessage.value = false, 10000)
}

function calcToTokenString(calc: CalculationItem[]): string {
  return calc.map(item =>
    item.source === 'operator' ? item.field : `${item.source}:${item.field}`
  ).join(',')
}

async function applyComparison(calc: CalculationItem[] | null) {
  showCompareModal.value = false

  if (calc === null) {
    // Modal was cancelled without submitting - keep any active comparison as-is
    return
  }

  if (calc === currentCalculation.value) {
    // Modal cancel emits the loaded calculation by reference; a re-apply would
    // be a redundant identical fetch, so treat it as a no-op
    return
  }

  currentCalculation.value = calc

  if (!calc || calc.length === 0 || !selectedState.value) {
    clearComparison()
    return
  }

  try {
    const results = await financialApi.compareStateMunicipalities(
      selectedState.value.abbr,
      calcToTokenString(calc),
      currentYearMode.value
    )
    activeComparison.value = results
    renderComparison()
  } catch (e: unknown) {
    const detail = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
    showCompareError(detail || 'Comparison failed')
    clearComparison()
  }
}

function clearComparison() {
  activeComparison.value = []
  currentCalculation.value = []
  if (municipalLayer) {
    municipalLayer.setStyle(defaultBoundaryStyle)
    municipalLayer.eachLayer((layer: { unbindTooltip: () => void }) => {
      layer.unbindTooltip()
    })
  }
}

async function toggleYearMode() {
  currentYearMode.value = currentYearMode.value === 'latest' ? 'shared' : 'latest'
  if (currentCalculation.value.length) {
    await applyComparison(currentCalculation.value)
  }
}

function renderComparison() {
  if (!municipalLayer || !activeComparison.value.length) return

  const valueByMid = new Map(activeComparison.value.map(r => [r.mid, r.value]))

  const values = activeComparison.value.map(r => r.value)
  const colorScale = chroma.scale(["#F8C1B3", "#ee6c4d", "#671C0A", "#1D0803"])
    .domain(chroma.limits(values, 'q', 15))

  municipalLayer.setStyle((feature?: { properties?: { mid?: string } }) => {
    const mid = feature?.properties?.mid
    const value = mid ? valueByMid.get(mid) : undefined
    if (value === undefined) {
      return defaultBoundaryStyle
    }
    return {
      color: 'transparent',
      fillColor: colorScale(value).hex(),
      fillOpacity: 0.85,
      weight: 0
    }
  })

  municipalLayer.eachLayer((layer: { feature?: { properties?: { mid?: string } }, unbindTooltip: () => void, bindTooltip: (t: string) => void }) => {
    layer.unbindTooltip()
    const mid = layer.feature?.properties?.mid
    const value = mid ? valueByMid.get(mid) : undefined
    layer.bindTooltip(value !== undefined ? `Value: ${value.toFixed(2)}` : 'No data')
  })
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

  // Re-apply an active comparison after a layer rebuild
  if (activeComparison.value.length) {
    renderComparison()
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

// Reset comparison when a different state is selected
watch(selectedState, (newState, oldState) => {
  if (oldState && newState !== oldState) {
    financesFieldsCache.value = null
    currentYearMode.value = 'latest'
    clearComparison()
  }
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
            <div v-if="showCompareMessage" class="text-red-500 absolute top-10 right-4 p-2 text-sm bg-white shadow-lg shadow-neutral-500 border border-gray-300 rounded z-50">
              {{ compareMessage }}
            </div>

            <!-- Buttons Container -->
            <div v-if="municipalBoundaryView && selectedState" class="absolute bottom-0 left-0 mb-7 ml-2.5 flex z-20">
              <ToolbarRoot
                class="flex w-full max-w-[610px] min-w-max rounded-lg bg-white shadow-sm border-2 border-neutral-400/65 overflow-clip"
                aria-label="Map frame options"
              >
                <ToolbarButton
                  :class="toolbarButtonClass"
                  @click="onOpenCompare"
                >
                  Compare
                </ToolbarButton>
                <ToolbarButton v-if="activeComparison.length"
                  :class="toolbarButtonClass"
                  :title="'Clear comparison (Year mode: ' + currentYearMode + ')'"
                  @click="clearComparison"
                >
                  Clear
                </ToolbarButton>
                <ToolbarSeparator class="w-px bg-neutral-400/65" />
                <ToolbarButton
                  :class="toolbarButtonClass"
                  :title="'Year mode: ' + currentYearMode + (currentCalculation.length ? ' (click to switch)' : ' (used for the next comparison)')"
                  @click="toggleYearMode"
                >
                  Year: {{ currentYearMode === 'shared' ? 'shared' : 'latest' }}
                </ToolbarButton>
              </ToolbarRoot>
            </div>
        </div>
    </template>
  </FinanceBaseFrame>
  <CalculationsModal v-if="showCompareModal"
    :datasets="compareFieldList"
    :loadedCalc="currentCalculation"
    @close="(calc:CalculationItem[] | null) => applyComparison(calc)"
  />
</template>

<style scoped>

</style>
