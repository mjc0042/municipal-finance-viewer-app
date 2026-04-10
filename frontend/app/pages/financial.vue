<script setup lang="ts">
import { ref } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { useFramesStore } from '@/stores/frames'
import { financialApi } from '@/composables/api/financialApi'
import { nanoid } from 'nanoid'
import { storeToRefs } from 'pinia'
import type { SearchMunicipalityEvent, SelectMunicipalityEvent } from '~/types/events/selectMunicipalityEvent'
import type { ShowMunicipalFinancesEvent } from '~/types/events/showMunicipalFinancesEvent'
import { FrameType } from '@/types/store/frames'
import type { StateInfo } from '@/types/store/finance'

definePageMeta({
  middleware: 'auth'
})

const financeStore = useFinanceStore()
const framesStore = useFramesStore()
const { frames }  = storeToRefs(framesStore)
const stateInfoList = ref<StateInfo[]>([])

let stateBoundaries;
async function fetchStateData() {
  // Simulate an API call
  const response = await financialApi.getStateBoundaries();
  stateBoundaries = Object.freeze(response);
  stateInfoList.value = response.map((f: any) => ({
    name: f.properties.name,
    abbr: f.properties.stusps,
    code: f.properties.statefp,
  }))
}

// Add new US map frame with unique id
function addNewMapFrame() {
  framesStore.addFrame({
    id: nanoid(),
    title: 'US',
    type: FrameType.MapUS,
    minimized: false,
    position: { x: 120, y: 120 },
    size: { width: 600, height: 600},
    trayIndex: undefined,
    zIndex: 100
  })
}

function onAddNewMunicipalMapFrame(event: SelectMunicipalityEvent) {
  const frameId = nanoid()
  financeStore.setSelectedMunicipality(frameId, event.stateInfo.code, event.featureId, event.mid)
  framesStore.addFrame({
    id: frameId,
    title: event.municipalityName + ', ' + event.stateInfo.abbr,
    type: FrameType.MapMunicipal,
    minimized: false,
    position: { x: 120, y: 120 },
    size: { width: 600, height: 600},
    trayIndex: undefined,
    zIndex: 100
  })
}

async function onAddMunicipalFinancesFromSearch({ municipalityInfo }: SearchMunicipalityEvent) {
  
  // Get state code
  const stateInfo:StateInfo = stateInfoList.value.find(s => s.abbr === municipalityInfo.state) ?? {
    name: "",
    abbr: municipalityInfo.state,
    code: municipalityInfo.county_fips.substring(0,2)
  };

  // Get municipality GIS data
  const boundaries = await financeStore.getStateMunicipalBoundaries(
    stateInfo.name,
    stateInfo.abbr,
    stateInfo.code
  )

  // Find the feature by matching mid in the feature properties
  const feature = boundaries?.features.find(f => f.properties.mid === municipalityInfo.mid)
  const featureId = feature?.id ?? -1

  onAddNewMunicipalMapFrame({
    stateInfo: stateInfo,
    featureId: featureId,
    mid: municipalityInfo.mid,
    municipalityName: municipalityInfo.name
  });
}

function onAddMunicipalFinancesFrame(event: ShowMunicipalFinancesEvent) {
  console.log("Adding municipal finances frame")
  const frameId = nanoid()
  financeStore.addMunicipalFinancesForFrame(frameId, event.mid)
  framesStore.addFrame({
    id: frameId,
    title: event.municipalityName + ' - Finances',
    type: FrameType.FinanceInfo,
    minimized: false,
    position: { x: 120, y: 120 },
    size: { width: 600, height: 600},
    trayIndex: undefined,
    zIndex: 100

  })
}

function onAddMunicipalChartsFrame(mid: string, municipalityName: string) {
  const frameId = nanoid()
  financeStore.addMunicipalFinancesForFrame(frameId, mid)
  framesStore.addFrame({
    id: frameId,
    title: municipalityName + ' - Charts',
    type: FrameType.FinanceCharts,
    minimized: false,
    position: { x: 120, y: 120 },
    size: { width: 600, height: 450},
    trayIndex: undefined,
    zIndex: 100

  })
}

function onCloseFrame(frameId:string, frameType:FrameType) {
  financeStore.removeFrameData(frameId, frameType)
}

onMounted(() => {
  fetchStateData()
})

</script>

<template>
  <div class="h-screen flex flex-col">
    <NavBar class="shrink-0"/>

    <!-- Working area -->
    <div class="grow bg-[#303030] z-0 overflow-hidden relative">
      <div class="absolute z-30">
        <FinanceSearch @searchMunicipality="onAddMunicipalFinancesFromSearch" />
        <button @click="addNewMapFrame" 
          class="relative m-2 flex justify-center items-center p-2 bg-white rounded-xs drop-shadow-xl/25 overflow-hidden cursor-pointer text-black hover:text-neutral-700">
            <Icon name="carbon:add-large" size="24" />
        </button>
      </div>
      <div class="absolute z-10">
        <FinanceMapFrame
          v-for="frame in frames.filter(f => f.type === FrameType.MapUS || f.type === FrameType.MapState)"
          :key="frame.id"
          :frame="frame"
          :stateBoundaries="stateBoundaries"
          @selectMunicipality="onAddNewMunicipalMapFrame"
          @closeFrame="onCloseFrame"
        />
        <FinanceMunicipalMapFrame
          v-for="frame in frames.filter(f => f.type === FrameType.MapMunicipal && financeStore.getSelectedMunicipality(f.id) !== null)"
          :key="frame.id"
          :frame="frame"
          :municipal-boundary="financeStore.getSelectedMunicipality(frame.id)!"
          @showFinances="onAddMunicipalFinancesFrame"
          @showCharts="onAddMunicipalChartsFrame"
          @closeFrame="onCloseFrame"
        />
        <FinanceMunicipalInfoFrame
          v-for="frame in frames.filter(f => f.type === FrameType.FinanceInfo)"
          :key="frame.id"
          :frame="frame"
          @closeFrame="onCloseFrame"
        />
        <FinanceMunicipalChartFrame
          v-for="frame in frames.filter(f => f.type === FrameType.FinanceCharts)"
          :key="frame.id"
          :frame="frame"
          @closeFrame="onCloseFrame"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
