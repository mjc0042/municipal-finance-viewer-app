<script setup lang="ts">
import { ref, computed } from 'vue'
import { financialApi } from '~/composables/api/financialApi'
import type { MissingData } from '~/types/http/missingData'

const errorMessage = ref<string | null>('')
const missingDataList = ref<MissingData[]>([])
const isLoading = ref(false)
const selectedItem = ref<MissingData | null>(null)

// Filter values
const filterState = ref<string>('')
const filterPriority = ref<string>('')
const filterStatus = ref<string>('pending')
const filterOptional = ref<boolean | null>(null)

// Computed filtered data
const filteredData = computed(() => {
  return missingDataList.value.filter(item => {
    const stateMatch = !filterState.value || item.state === filterState.value
    const priorityMatch = !filterPriority.value || item.priority === filterPriority.value
    const statusMatch = !filterStatus.value || item.status === filterStatus.value
    const optionalMatch = filterOptional.value === null || item.optional === filterOptional.value
    return stateMatch && priorityMatch && statusMatch && optionalMatch
  })
})

// Get unique values for filter options
const uniqueStates = computed(() => {
  const states = new Set(missingDataList.value.map(item => item.state))
  return Array.from(states).sort()
})

const uniquePriorities = computed(() => {
  const priorities = new Set(missingDataList.value.map(item => item.priority))
  return Array.from(priorities).sort()
})

const uniqueStatuses = computed(() => {
  const statuses = new Set(missingDataList.value.map(item => item.status))
  return Array.from(statuses).sort()
})

function clearFilters() {
  filterState.value = ''
  filterPriority.value = ''
  filterStatus.value = ''
  filterOptional.value = null
}

async function getMissingData() {
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const data = await financialApi.getMissingFinanceData()

    const priorityOrder = { high: 1, medium: 2, low: 3 }
    missingDataList.value = data.sort((a,b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  } catch (ex: any) {
    errorMessage.value = ex.response?.data?.error || "Unable to get missing data"
    missingDataList.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  getMissingData()
})

async function onClickDataRow(item: MissingData) {
  selectedItem.value = item
}

function closePanel() {
  selectedItem.value = null
}

function isSelected(item:MissingData):boolean {
    return selectedItem.value?.gap_id ===item.gap_id
}
</script>

<template>
    <div class="flex-1 flex h-full overflow-hidden">
        <!-- Left panel - Table -->
        <div class="flex-1 flex flex-col p-4 overflow-hidden" :class="{ 'w-1/2': selectedItem }">
            <!-- Error message -->
            <div v-if="errorMessage" class="text-red-600 bg-red-50 border border-red-200 p-4 rounded mb-4">
                {{ errorMessage }}
            </div>

            <!-- Loading state -->
            <div v-if="isLoading" class="text-neutral-500">Loading...</div>

            <!-- Filter controls -->
            <div v-else-if="missingDataList.length > 0" class="flex gap-4 mb-4 items-center shrink-0">
                <div class="flex items-center gap-2">
                    <label class="text-sm text-neutral-600">State:</label>
                    <select v-model="filterState" class="px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value="">All</option>
                        <option v-for="state in uniqueStates" :key="state" :value="state">{{ state }}</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-sm text-neutral-600">Priority:</label>
                    <select v-model="filterPriority" class="px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value="">All</option>
                        <option v-for="priority in uniquePriorities" :key="priority" :value="priority">{{ priority }}</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-sm text-neutral-600">Status:</label>
                    <select v-model="filterStatus" class="px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value="">All</option>
                        <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-sm text-neutral-600">Optional:</label>
                  <select v-model="filterOptional" class="px-2 py-1 border border-gray-300 rounded text-sm">
                    <option :value="null">All</option>
                    <option :value="true">Optional Only</option>
                    <option :value="false">Required Only</option>
                  </select>
                </div>
                <button 
                    v-if="filterState || filterPriority || filterStatus || filterOptional"
                    @click="clearFilters"
                    class="text-sm text-blue-600 hover:text-blue-800"
                >
                    Clear Filters
                </button>
                <div class="flex cursor-pointer text-neutral-800 hover:text-neutral-700"
                  @click="getMissingData">
                  <Icon name="material-symbols:refresh" size="24" />
                </div>
                <span class="text-sm text-neutral-500 ml-auto">
                    Showing {{ filteredData.length }} of {{ missingDataList.length }}
                </span>
            </div>

            <!-- Missing data table with scroll -->
            <div v-else-if="!errorMessage" class="text-neutral-500">
                No missing data records found.
            </div>

            <div v-if="filteredData.length > 0" class="flex-1 overflow-auto border border-gray-200 rounded">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 sticky top-0">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Point</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in filteredData" :key="item.gap_id" 
                        class="cursor-pointer transition-colors"
                        :class="{
                        'bg-blue-100 hover:bg-blue-100': isSelected(item),
                        'hover:bg-gray-50': !isSelected(item)
                        }"
                        @click="onClickDataRow(item)"
                    >
                        <td class="px-4 py-2">{{ item.state }}</td>
                        <td class="px-4 py-2">{{ item.municipality_name }}</td>
                        <td class="px-4 py-2">{{ item.year }}</td>
                        <td class="px-4 py-2">{{ item.table_name }}</td>
                        <td class="px-4 py-2">{{ item.data_point }}</td>
                        <td class="px-4 py-2">{{ item.priority }}</td>
                        <td class="px-4 py-2">{{ item.status }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- Right panel - PDF view (conditional) -->
        <AdminMissingDataSidePanel v-if="selectedItem"
          :selectedItem="selectedItem"
          @onClose="closePanel" />
    </div>
</template>

<style scoped>
</style>
