<script setup lang="ts">
import { ref, watch } from 'vue'
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

const currentFinances = computed(() => {
  console.log(municipalFinances.value)
  return municipalFinances.value.length > 0 ? municipalFinances.value[0] : null
})

const formatCurrency = (value: number | null): string => {
  if (!value) return '$0';
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

        <div class="mb-4 text-neutral-800">{{currentFinances?.year}}</div>

        <div v-if="currentFinances" class="mb-4">
          <FinanceDataRow label="Population" :value="currentFinances.population" :formatter="formatNumber" />
          <FinanceDataRow label="Per Capita Income" :value="currentFinances.per_capita_income" :formatter="formatCurrency" />
          <FinanceDataRow label="Population Density" :value="currentFinances.population" :formatter="formatNumber" />
          <FinanceDataRow label="Park Facilities" :value="currentFinances.parks" :formatter="formatNumber" />
          <FinanceDataRow label="Land Area (sq mi)" :value="0" :formatter="formatNumber" />
        </div>

        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="currentFinances" class="mb-4">
          <h4 class="font-semibold mb-1">Net Position</h4>
          <FinanceDataRow label="Current Assets" :value="currentFinances.current_assets" :formatter="formatCurrency" />
          <FinanceDataRow label="Capital Assets" :value="currentFinances.capital_assets" :formatter="formatCurrency" />
          <FinanceDataRow label="Total Assets" :value="currentFinances.total_assets" :formatter="formatCurrency" />
          <FinanceDataRow label="Deferred Outflows" :value="currentFinances.deferred_outflows" :formatter="formatCurrency" />
          <FinanceDataRow label="Liabilities" :value="currentFinances.liabilities" :formatter="formatCurrency" />
          <FinanceDataRow label="Deferred Inflows" :value="currentFinances.deferred_inflows" :formatter="formatCurrency" />
          <div class="flex justify-between py-0.5"></div>
          <FinanceDataRow label="Total Revenues" :value="currentFinances.total_revenues" :formatter="formatCurrency" />
          <FinanceDataRow label="Operating Grants" :value="currentFinances.operating_grants" :formatter="formatCurrency" />
          <FinanceDataRow 
            label="Capital Grants" :value="currentFinances.capital_grants" :formatter="formatCurrency" />
          <FinanceDataRow label="Interest Charges" :value="currentFinances.interest_charges" :formatter="formatCurrency" />
          <div class="flex justify-between py-0.5"></div>
          <FinanceDataRow label="Taxable Assessed Value" :value="currentFinances.taxable_assessed_value" :formatter="formatCurrency" />
          <FinanceDataRow label="Property Tax Revenue" :value="currentFinances.property_taxes_levied" :formatter="formatCurrency" />
        </div>

        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="currentFinances" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Debt</h4>
          <FinanceDataRow label="Debt (General)" :value="currentFinances.debt" :formatter="formatCurrency" />
          <FinanceDataRow label="Debt (Total Primary Government)" :value="currentFinances.debt_total_primary_government" :formatter="formatCurrency" />
        </div>

        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="currentFinances" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Infrastructure</h4>
          <FinanceDataRow label="Street Miles" :value="currentFinances.street_miles" :formatter="formatNumber" />
          <FinanceDataRow label="Sewer Miles" :value="currentFinances.sewer_miles" :formatter="formatNumber" />
          <FinanceDataRow label="Water Main Miles" :value="currentFinances.water_main_miles" :formatter="formatNumber" />
        </div>
        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="currentFinances" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Staffing</h4>
          <FinanceDataRow label="Police (Civilian/Non-civilian)" :value="currentFinances.police_force" :formatter="formatNumber" />
          <FinanceDataRow label="Fire Dept." :value="currentFinances.fire_dept" :formatter="formatNumber" />
          <FinanceDataRow label="Total Employees" :value="currentFinances.total_employees" :formatter="formatNumber" />
        </div>
        <div class="border-t border-neutral-300 my-3"></div>
        <div v-if="currentFinances" class="mb-4">
          <h4 class="font-semibold mb-1 text-black">Principal Employers</h4>
          <span 
            v-for="(employer, idx) in currentFinances?.principal_employers?.split('+') || []" 
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
