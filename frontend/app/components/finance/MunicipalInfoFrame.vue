<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { MunicipalityFinance } from '@/types/http/finance'
import { useFinanceStore } from '@/stores/finance'
import type { Frame, FrameType } from '@/types/store/frames'

const props = defineProps<{
  frame: Frame
}>()

const emit = defineEmits<{
  (e: 'closeFrame', frameId:string, frameType:FrameType): void
}>()

const municipalFinances = computed(() => {
  const finances = useFinanceStore().getMunicipalFinancesByFrame(props.frame.id)
  return finances || []
})

const currentIndex = ref(municipalFinances.value.length > 0 ? municipalFinances.value.length -1 : 0)

const hasPreviousYear = computed(() => currentIndex.value > 0)
const hasNextYear = computed(() => currentIndex.value < municipalFinances.value.length - 1)

// NEW: Navigation functions
const goToPreviousYear = () => {
  if (hasPreviousYear.value) {
    currentIndex.value--
  }
}

const goToNextYear = () => {
  if (hasNextYear.value) {
    currentIndex.value++
  }
}

const financesForYear = computed(() => {
  console.log(municipalFinances.value)
  return municipalFinances.value.length > 0 ? municipalFinances.value[currentIndex.value] : null
})

// Watch for changes in municipalFinances to reset currentIndex if needed
watch(municipalFinances, (newFinances) => {
  if (newFinances.length > 0) {
    currentIndex.value = newFinances.length - 1
  } else {
    currentIndex.value = 0
  }
})


const formatCurrency = (value: number | null): string => {
  if (!value) return '-';
  const num = value;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
};

const formatNumber = (value: number | null): string => {
  if (!value) return 'N/A';
  return value.toLocaleString();
};

</script>

<template>
  <FinanceBaseFrame
    v-bind="{ 
      frame: props.frame
    }"
    @closeFrame="emit('closeFrame', $props.frame.id, $props.frame?.type)"
  >
    <template #default="{ size }">
      <div class="p-3 w-full h-full overflow-auto bg-white text-black">

        <div class="mb-4 text-neutral-800 flex items-center gap-2">
          <button 
            @click="goToPreviousYear" 
            class="p-1 hover:bg-neutral-200 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!hasPreviousYear"
            aria-label="Previous year"
          >
            <Icon name="carbon:caret-left" class="w-5 h-5" />
          </button>
          <span class="font-semibold">{{ financesForYear?.year }}</span>
          <button 
            @click="goToNextYear" 
            class="p-1 hover:bg-neutral-200 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!hasNextYear"
            aria-label="Next year"
          >
            <Icon name="carbon:caret-right" class="w-5 h-5" />
          </button>
        </div>

        <div v-if="financesForYear" class="mb-4">
          <FinanceDataRow label="Population" :value="financesForYear.population" :formatter="formatNumber" />
          <FinanceDataRow label="Per Capita Income" :value="financesForYear.per_capita_income" :formatter="formatCurrency" />
          <FinanceDataRow label="Population Density" :value="financesForYear.population" :formatter="formatNumber" />
          <FinanceDataRow label="Park Facilities" :value="financesForYear.parks" :formatter="formatNumber" />
          <FinanceDataRow label="Land Area (sq mi)" :value="0" :formatter="formatNumber" />
        </div>

        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="financesForYear" class="mb-4">
          <h4 class="font-semibold mb-1">Net Position</h4>
          <FinanceDataRow label="Current Assets" :value="financesForYear.current_assets" :formatter="formatCurrency" />
          <FinanceDataRow label="Capital Assets" :value="financesForYear.capital_assets" :formatter="formatCurrency" />
          <FinanceDataRow label="Total Assets" :value="financesForYear.total_assets" :formatter="formatCurrency" />
          <FinanceDataRow label="Deferred Outflows" :value="financesForYear.deferred_outflows" :formatter="formatCurrency" />
          <FinanceDataRow label="Liabilities" :value="financesForYear.liabilities" :formatter="formatCurrency" />
          <FinanceDataRow label="Deferred Inflows" :value="financesForYear.deferred_inflows" :formatter="formatCurrency" />
          <div class="flex justify-between py-0.5"></div>
          <FinanceDataRow label="Total Revenues" :value="financesForYear.total_revenues" :formatter="formatCurrency" />
          <FinanceDataRow label="Operating Grants" :value="financesForYear.operating_grants" :formatter="formatCurrency" />
          <FinanceDataRow 
            label="Capital Grants" :value="financesForYear.capital_grants" :formatter="formatCurrency" />
          <FinanceDataRow label="Interest Charges" :value="financesForYear.interest_charges" :formatter="formatCurrency" />
          <div class="flex justify-between py-0.5"></div>
          <FinanceDataRow label="Taxable Assessed Value" :value="financesForYear.taxable_assessed_value" :formatter="formatCurrency" />
          <FinanceDataRow label="Property Tax Revenue" :value="financesForYear.property_taxes_levied" :formatter="formatCurrency" />
        </div>

        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="financesForYear" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Debt</h4>
          <FinanceDataRow label="Debt (General)" :value="financesForYear.debt" :formatter="formatCurrency" />
          <FinanceDataRow label="Debt (Total Primary Government)" :value="financesForYear.debt_total_primary_government" :formatter="formatCurrency" />
        </div>

        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="financesForYear" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Infrastructure</h4>
          <FinanceDataRow label="Street Miles" :value="financesForYear.street_miles" :formatter="formatNumber" />
          <FinanceDataRow label="Sewer Miles" :value="financesForYear.sewer_miles" :formatter="formatNumber" />
          <FinanceDataRow label="Water Main Miles" :value="financesForYear.water_main_miles" :formatter="formatNumber" />
        </div>
        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="financesForYear" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Staffing</h4>
          <FinanceDataRow label="Police (Civilian/Non-civilian)" :value="financesForYear.police_force" :formatter="formatNumber" />
          <FinanceDataRow label="Fire Dept." :value="financesForYear.fire_dept" :formatter="formatNumber" />
          <FinanceDataRow label="Total Employees" :value="financesForYear.total_employees" :formatter="formatNumber" />
        </div>
        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="financesForYear" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Principal Employers</h4>
          <span 
            v-for="(employer, idx) in financesForYear?.principal_employers?.split('+') || []" 
            :key="idx" 
            class="flex text-sm text-neutral-500"
          >
            {{ employer }}
          </span>
        </div>
      </div>
    </template>
  </FinanceBaseFrame>
</template>

<style scoped>
</style>
