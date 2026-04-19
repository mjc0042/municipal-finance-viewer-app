<script setup lang="ts">
import chroma from "chroma-js"
import { evaluate } from 'mathjs'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { ToolbarButton, ToolbarRoot, ToolbarSeparator } from 'reka-ui'
import { ref  } from 'vue'
import CalculationsModal from './CalculationsModal.vue'
import type { CalculationItem } from './CalculationsModal.vue'
import { getNumberFields } from "~/composables/finance/calculationUtils"
import type { ShowMunicipalFinancesEvent } from '@/types/events/showMunicipalFinancesEvent'
import type { MunicipalFeature, ParcelUploadResponse, ParcelFeature } from '@/types/http/gis'
import type { MunicipalityFinance } from '@/types/http/finance'
import { FrameType, type Frame } from '@/types/store/frames'
import { useFinanceStore } from '@/stores/finance'

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

const defaultParcelStyle = {
  color: '#040203',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.1
}


const mapRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const message = ref('')
const messageType = ref('success')
const showMessage = ref(false)
const parcelData = ref<ParcelUploadResponse | null>(null)
const customParcels = ref<ParcelUploadResponse | null>(null)

const showAnalysisModal = ref(false)
const currentCalculation = ref<CalculationItem[]>([])

const municipalFinances = computed(() => {
  const finances = useFinanceStore().getMunicipalFinancesByMid(props.municipalBoundary.properties.mid)
  return finances || []
})

let mapInstance: L.Map | null = null
let municipalLayer: L.GeoJSON<any> | null = null
let parcelLayer: L.GeoJSON<any> | null = null

function clearLayers() {
  if (municipalLayer) {
    municipalLayer.remove()
    municipalLayer = null
  }
  if (parcelLayer) {
    parcelLayer.remove()
    parcelLayer = null
  }
}

function addParcelLayer(geojson: any, style: any, onEach?: any) {
  if (parcelLayer) {
    parcelLayer.remove()
  }
  if (mapInstance) {
    parcelLayer = L.geoJSON(geojson, {
      style: typeof style === 'function' ? style : () => style,
      onEachFeature: onEach || (() => {})
    }).addTo(mapInstance)

    if (municipalLayer) {
      municipalLayer.setStyle({
        color: '#2c3e50',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0,
        dashArray: '5, 5'
      })
    }
  }
}

function addMunicipalLayer() {

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
  if (parcelLayer) {
    parcelLayer.remove()
    parcelLayer = null
  }
})

function onClickAddParcelData() {
  fileInputRef.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    message.value = 'Processing parcel file...'
    messageType.value = 'success'
    showMessage.value = true
    try {
      const store = useFinanceStore()
      const response = await store.addParcelDataForFrame(
        props.frame.id,
        file,
        props.municipalBoundary.properties.mid,
        props.municipalBoundary
      )

      if (response && 'error' in response) {
        message.value = response.error;
        messageType.value = 'error';
      } else if (response && 'features' in response) {
        message.value = 'Success';
        parcelData.value = response
        addParcelLayer(response, defaultParcelStyle);
      } else {
        message.value = 'Upload failed';
        messageType.value = 'error';
      }
    } catch (e) {
      message.value = 'Upload failed'
      messageType.value = 'error'
    }
    setTimeout(() => showMessage.value = false, 10000)
  }
}

async function updateParcelLayer() {

}

// Add function
function applyCalculation(calc: CalculationItem[]) {
  
  try {
    if (!calc || calc.length == 0) {
      // If custom parcels previously applied, reset to normal parcel data with default styling
      if (customParcels.value !== null) {

        customParcels.value = null
        addParcelLayer(parcelData.value, defaultParcelStyle)
      }
      return
    }

    if (!municipalFinances || !parcelData.value || !parcelData.value.features) {
      return
    }

    // TODO: handle missing data for fields

    // Create new parcel geojson list
    const values: number[] = []
    customParcels.value = parcelData.value

    // Loop through all parcel features
    customParcels.value.features.forEach((feature:any) => {
      let expr = ''
      calc.forEach(item => {
        if (item.source === 'operator') expr += item.field
        else if (item.source === 'finances') expr += municipalFinances.value[municipalFinances.value.length-1][item.field] || 0
        else if (item.source === 'municipality') expr += props.municipalBoundary.properties[item.field] || 0
        else if (item.source === 'parcelData') expr += feature.properties[item.field] || 0
      })

      const value = evaluate(expr)
      feature.calculatedValue = value
      values.push(value)
    })

    const colorScale = chroma.scale(["#F8C1B3","#ee6c4d", "#671C0A", "#1D0803"]).domain(chroma.limits(values, 'q', 15))

    addParcelLayer(customParcels.value, 
      (feature: any) => ({
        color: "transparent",
        fillColor: colorScale(feature.calculatedValue).hex(), 
        fillOpacity: 0.85,
        weight: 0
      }),
      (feature: any, layer: any) => { layer.bindTooltip(`Value: ${feature.calculatedValue.toFixed(2)}`) }
    )
  }
  catch (ex) {
    console.log(ex)
  }
}

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
          <div v-if="showMessage" :class="messageType === 'error' ? 'text-red-500' : 'text-blue-500'" class="absolute top-10 right-4 p-2 text-sm bg-white shadow-lg shadow-neutral-500 border border-gray-300 rounded z-50">
          {{ message }}
          </div>

          <!-- Buttons Container -->
          <div class="absolute bottom-0 left-0 mb-7 ml-2.5 flex z-20">
            <ToolbarRoot
              class="flex w-full max-w-[610px] min-w-max rounded-lg bg-white shadow-sm border-2 border-neutral-400/65 overflow-clip"
              aria-label="Formatting options"
            >
              <ToolbarButton v-if="!parcelData"
                class="p-4 font-semibold bg-white shrink-0 grow-0 basis-auto h-[25px] inline-flex text-md leading-none items-center justify-center outline-none cursor-pointer hover:bg-neutral-300/50 focus:relative"
                style="margin-left: auto"
                @click=onClickAddParcelData
              >
                Parcels
              </ToolbarButton>
              <ToolbarButton v-if="parcelData"
                class="p-4 font-semibold bg-white shrink-0 grow-0 basis-auto h-[25px] inline-flex text-md leading-none items-center justify-center outline-none cursor-pointer hover:bg-neutral-300/50 focus:relative"
                style="margin-left: auto"
                @click="showAnalysisModal = true"
              >
                Analysis
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
          <input
            ref="fileInputRef"
            type="file"
            accept=".zip"
            style="display: none"
            @change="onFileSelected"
          />
        </div>
    </template>
  </FinanceBaseFrame>
  <CalculationsModal v-if="showAnalysisModal"
    :datasets="{
      'Municipal Finances': { source: 'finances', fields: getNumberFields(municipalFinances[0]) },
      'Municipality' : { source: 'municipality', fields: getNumberFields(props.municipalBoundary.properties)},
      'Parcels': { source: 'parcelData', fields: getNumberFields(parcelData?.features[0]?.properties) }
    }"
    :loadedCalc="currentCalculation"
    @close="(calc:CalculationItem[]) => { showAnalysisModal = false; currentCalculation = calc; applyCalculation(calc) }"
  />
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
