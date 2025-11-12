<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceCharts } from '@/composables/finance/financeCharts'
import { useFinanceStore } from '@/stores/finance'
import type { Frame, FrameType } from '@/types/store/frames'

const props = defineProps<{
  frame: Frame,
}>()

const emit = defineEmits<{
  (e: 'closeFrame', frameId:string, frameType:FrameType): void
}>()

const municipalFinances = computed(() => {
  const finances = useFinanceStore().getMunicipalFinancesByFrame(props.frame.id)
  return finances || []
})

const {
  years,
  netPositionData,
  financialAssetsLiabilitiesData,
  totalAssetsLiabilitiesData,
  debtRevenueData,
  interestRevenueData,
  bookValueCapitalAssets,
  govTransfersRevData
} = useFinanceCharts(municipalFinances.value)

const selectedChart = ref('netPosition')
const chartRef = ref<any>(null)

// Chart titles mapping
const chartTitles: Record<string, string> = {
  netPosition: 'Net Financial Position',
  financialAssetsLiabilities: 'Financial Assets to Liabilities Ratio',
  totalAssetsLiabilities: 'Total Assets to Liabilities Ratio',
  debtRevenue: 'Debt to Revenue Ratio',
  interestRevenue: 'Interest to Revenue Ratio',
  bookValueCapitalAssets: 'Net Book Value to Cost of Capital Assets Ratio',
  govTransfersRev: 'Government Transfers to Revenue Ratio'
}

// Chart data mapping
const chartDataMap: Record<string, any> = {
  netPosition: netPositionData.value,
  financialAssetsLiabilities: financialAssetsLiabilitiesData.value,
  totalAssetsLiabilities: totalAssetsLiabilitiesData.value,
  debtRevenue: debtRevenueData.value,
  interestRevenue: interestRevenueData.value,
  bookValueCapitalAssets: bookValueCapitalAssets.value,
  govTransfersRev: govTransfersRevData.value
}

// Computed properties for dynamic chart configuration
const chartTitle = computed(() => chartTitles[selectedChart.value] || 'Financial Chart')
const selectedData = computed(() => chartDataMap[selectedChart.value] || [] )

function onDownloadChart() {

}

function onResize(size: { width: number; height: number }) {
  if (chartRef.value?.resize) {
    chartRef.value.resize(size)
  }
}

</script>

<template>
  <FinanceBaseFrame
    v-bind="{
      frame: props.frame
    }"
    @resize="onResize"
    @closeFrame="emit('closeFrame', $props.frame.id, $props.frame?.type)"
  >
    <div class="chart-container">
      <select v-model="selectedChart" class="m-2 border rounded px-2 py-1 bg-neutral-800 text-white border-neutral-500 font-medium text-sm">
        <option value="netPosition">Net Financial Position</option>
        <option value="financialAssetsLiabilities">Financial Assets to Liabilities</option>
        <option value="totalAssetsLiabilities">Total Assets to Liabilities</option>
        <option value="debtRevenue">Debt to Revenue</option>
        <option value="interestRevenue">Interest to Revenue</option>
        <option value="bookValueCapitalAssets">Net Book Value to Cost of Capital Assets</option>
        <option value="govTransfersRev">Government Transfers to Revenue</option>
      </select>
      <FinanceMunicipalChart
        v-if="municipalFinances.length > 0"
        ref="chartRef"
        :key="selectedChart"
        :title="chartTitle"
        xTitle=""
        yTitle=""
        :xDataSeries="years"
        :yDataSeries=selectedData />
      <!-- Buttons Container -->
      <!--div class="absolute bottom-0 left-0 mb-2 ml-2 flex z-20">
        <BaseButton intent="dark" class="" @click="onDownloadChart">
          Download
        </BaseButton>
      </div>-->
    </div>
  </FinanceBaseFrame>
</template>
