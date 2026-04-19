<script setup lang="ts">

export interface CalculationItem {
  source:string;
  field:string;
}

export interface Dataset {
  source:string;
  fields:string[];
}

const props = defineProps<{
  datasets: Record<string, Dataset>,
  loadedCalc: CalculationItem[]
}>()
const emit = defineEmits<{
  close: [calculation: CalculationItem[]]
}>()

const calculation = ref<CalculationItem[]>(props.loadedCalc || [])
const searchQuery = ref<string>('')
const selectedFilter = ref<string>('All')

// Computed filtered data points
const filteredDataPoints = computed(() => {
  const all = Object.entries(props.datasets).flatMap(([name, dataset]) =>
    dataset.fields.map(field => ({ sourceName: name, source: dataset.source, field, full: `${dataset.source}:${field}` }))
  )
  
  const filtered = all.filter(item =>
    selectedFilter.value === 'All' || item.sourceName === selectedFilter.value
  ).filter(item =>
    item.full.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  return filtered
})

function formatListItem(item:string) {

    return item.replaceAll('_',' ').toUpperCase()
}

// Functions
function addToCalculation(source:string, field:string) {
  const calcLen = calculation.value.length;
  if (calcLen == 0 || (calcLen > 0 && calculation.value[calcLen-1]?.source === "operator")) {
    calculation.value.push({
      source,
      field
    })
    searchQuery.value = ''
  }
}
function addOperator(op: string) {
  calculation.value.push({
    source: "operator",
    field: op
  })
}

function clearCalc() {
  calculation.value = []
}

function submit() {
  emit('close', calculation.value)
}
function cancel() {
  emit('close', props.loadedCalc)
}
</script>

<template>
<Teleport to="body">
  <div id="calculation-modal"
    class="fixed inset-0 flex items-center justify-center bg-black/75 box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none z-100"
  >
    <div class="relative p-4 w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-neutral-900 text-white border border-default rounded shadow-sm p-2 md:p-4">
            <!-- Modal header -->
            <div class="flex items-center justify-between pb-2">
                <div>
                  <span v-for="item in calculation"
                    class="p-1 mr-1 text-xs border rounded-sm border-black bg-slate-800 text-white"
                  >
                    {{ formatListItem(item.field) }}
                  </span>
                </div>
                <button type="button"
                    class="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center cursor-pointer"
                    data-modal-hide="default-modal"
                    @click="cancel"
                >
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class="space-y-4 md:space-y-6 py-4 md:py-3">
                <div class="flex flex-row border border-neutral-700 rounded p-2">
                    <input v-model="searchQuery" placeholder="Build calculation..."
                        class="basis-5/8"
                    />
                    <div class="basis-3/8 text-white">
                        <button class="ml-1 p-1 bg-neutral-800 border rounded border-neutral-950 cursor-pointer hover:bg-neutral-600" @click="addOperator('(')">(</button>
                        <button class="ml-1 p-1 bg-neutral-800 border rounded border-neutral-950 cursor-pointer hover:bg-neutral-600" @click="addOperator('+')">
                          <Icon name="mdi:plus" size="16" class="inline-block align-middle" />
                        </button>
                        <button class="ml-1 p-1 bg-neutral-800 border rounded border-neutral-950 cursor-pointer hover:bg-neutral-600" @click="addOperator('-')">
                          <Icon name="mdi:minus" size="16" class="inline-block align-middle" />
                        </button>
                        <button class="ml-1 p-1 bg-neutral-800 border rounded border-neutral-950 cursor-pointer hover:bg-neutral-600" @click="addOperator('*')">
                          <Icon name="mdi:close" size="16" class="inline-block align-middle" />
                        </button>
                        <button class="ml-1 p-1 bg-neutral-800 border rounded border-neutral-950 cursor-pointer hover:bg-neutral-600" @click="addOperator('/')">
                          <Icon name="mdi:division" size="16" class="inline-block align-middle" />
                        </button>
                        <button class="ml-1 p-1 bg-neutral-800 border rounded border-neutral-950 cursor-pointer hover:bg-neutral-600" @click="addOperator(')')">)</button>
                        <button class="ml-1 p-1 bg-neutral-800 border rounded border-neutral-950 cursor-pointer hover:bg-neutral-600" @click="clearCalc">Clear</button>
                    </div>
                </div>
                <div class="flex space-x-2 mb-4">
                    <button
                        v-for="sourceName in ['All', ...Object.keys(datasets)]"
                        :key="sourceName"
                        :class="selectedFilter === sourceName ? 'border-b-2 border-white' : ''"
                        class="px-4 py-2 transition-colors cursor-pointer"
                        @click="selectedFilter = sourceName"
                    >
                        {{ sourceName }}
                    </button>
                </div>
                <ul class="h-64 max-h-64 overflow-y-auto">
                    <li v-for="item in filteredDataPoints"
                        class="border-b border-neutral-700 p-1 text-sm hover:bg-neutral-700 cursor-pointer"
                        @click="addToCalculation(item.source, item.field)"
                    >
                        {{ formatListItem(item.field) }} 
                        <span class="text-xs text-neutral-600">
                            {{ formatListItem(item.sourceName) }}
                        </span>
                    </li>
                </ul>
            </div>
            <!-- Modal footer -->
            <div class="flex items-center border-t border-default space-x-4 pt-4 md:pt-5">
                <BaseButton intent="dark" data-modal-hide="default-modal"
                    class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
                    @click="submit"
                >Apply</BaseButton>
                <BaseButton intent="outline" data-modal-hide="default-modal"
                    class=""
                    @click="() => { clearCalc();  submit() }"
                >Clear</BaseButton>
            </div>
        </div>
    </div>
  </div>
</Teleport>
</template>

<style>

</style>
