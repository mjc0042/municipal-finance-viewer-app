<script setup lang="ts">
import { ref } from 'vue'
import { financialApi } from '~/composables/api/financialApi'
import type { MissingData } from '~/types/http/missingData'

const errorMessage = ref<string | null>('')
const missingDataList= ref<MissingData[]>([])
const isLoading = ref(false)
const selectedItem = ref<MissingData | null>(null);

onMounted(async () => {
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
    <div class="flex-1 flex">
        <!-- Left panel - Table -->
        <div class="flex-1 p-4 overflow-auto" :class="{ 'w-1/2': selectedItem }">
            <!-- Error message -->
            <div v-if="errorMessage" class="text-red-600 bg-red-50 border border-red-200 p-4 rounded mb-4">
                {{ errorMessage }}
            </div>

            <!-- Loading state -->
            <div v-if="isLoading" class="text-neutral-500">Loading...</div>

            <!-- Missing data table -->
            <table v-else-if="missingDataList.length > 0" class="min-w-full">
                <thead class="text-neutral-600">
                <tr class="border-b border-neutral-400">
                    <th class="px-4 py-2 text-left">State</th>
                    <th class="px-4 py-2 text-left">Name</th>
                    <th class="px-4 py-2 text-left">Year</th>
                    <th class="px-4 py-2 text-left">Table</th>
                    <th class="px-4 py-2 text-left">Data Point</th>
                    <th class="px-4 py-2 text-left">Priority</th>
                    <th class="px-4 py-2 text-left">Status</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in missingDataList" :key="item.gap_id" 
                    class="border-b border-gray-200 cursor-pointer transition-colors"
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

            <div v-else-if="!errorMessage" class="text-neutral-500">
                No missing data records found.
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
