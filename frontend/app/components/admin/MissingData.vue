<script setup lang="ts">
import { ref } from 'vue'
import { financialApi } from '~/composables/api/financialApi'
import type { MissingData } from '~/types/http/missingData'

const errorMessage = ref<string | null>('')
const missingDataList= ref<MissingData[]>([])
const isLoading = ref(false)
const selectedItem = ref<MissingData | null>(null);
const markdownContent = ref<string>('')
const isLoadingMarkdown = ref(false)
const userInput = ref<string>('')
const pdfUrl = ref<string>('')
const isLoadingPdf = ref(false)
const activeTab = ref<'markdown' | 'pdf'>('markdown')



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
  markdownContent.value = ''
  userInput.value = ''
  pdfUrl.value = ''
  activeTab.value = 'markdown'
}

async function loadMarkdown() {
  if (!selectedItem.value) return
  
  isLoadingMarkdown.value = true
  
  try {
    markdownContent.value = await financialApi.getMissingDataPdfSegment(
      selectedItem.value.municipality_id,
      selectedItem.value.year,
      selectedItem.value.pdf_page_indices[0] + ',' + selectedItem.value.pdf_page_indices[1]
    )
  } catch (ex: any) {
    markdownContent.value = `Error loading PDF content: ${ex.response?.data?.error || ex.message}`
  } finally {
    isLoadingMarkdown.value = false
  }
}

function closePanel() {
  selectedItem.value = null
  markdownContent.value = ''
  pdfUrl.value = ''
}

function submitValue() {
  console.log('Submitting:', { item: selectedItem.value, value: userInput.value })
}

async function loadFullPdf() {
  if (!selectedItem.value) return
  
  activeTab.value = 'pdf'
  isLoadingPdf.value = true
  pdfUrl.value = ''
  
  try {
    const response = await financialApi.getMissingDataFullPDF(
      selectedItem.value.municipality_id,
      selectedItem.value.year
    )
    pdfUrl.value = response
  } catch (ex: any) {
    console.error('Error loading full PDF:', ex)
    pdfUrl.value = ''
  } finally {
    isLoadingPdf.value = false
  }
}

function switchTab(tab: 'markdown' | 'pdf') {
  activeTab.value = tab
  if (tab === 'pdf' && !pdfUrl.value) {
    loadFullPdf()
  }
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
            <div 
            v-if="selectedItem" 
            class="w-1/2 border-l border-gray-300 flex flex-col bg-gray-50"
            style="height: 100vh;"
            >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-300 h-[5%] shrink-0">
                <div class="flex items-center gap-4">
                <h2 class="font-semibold">{{ selectedItem.municipality_name }} - {{ selectedItem.year }}</h2>
                <span class="text-gray-500 text-sm">{{ selectedItem.data_point }}</span>
                </div>
                <button @click="closePanel" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <!-- Tab Buttons-->
            <div class="h-[10%] shrink-0 border-b border-gray-300 flex">
              <button 
                class="flex-1 px-5 flex items-center justify-center text-sm font-medium transition-colors"
                :class="activeTab === 'markdown' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'"
                @click="switchTab('markdown')"
              >
                Markdown
              </button>
              <button 
                class="flex-1 px-5 flex items-center justify-center text-sm font-medium transition-colors"
                :class="activeTab === 'pdf' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'"
                @click="switchTab('pdf')"
                :disabled="isLoadingPdf"
              >
                {{ isLoadingPdf ? 'Loading...' : 'Full PDF' }}
              </button>
            </div>

            <!-- Content -->
            <div class="h-[70%] overflow-y-auto">
              <!-- Markdown content -->
              <div v-if="activeTab === 'markdown'" class="h-full p-4">
                <div v-if="!markdownContent" class="flex items-center justify-center h-full">
                  <button v-if="!isLoadingMarkdown"
                    @click="loadMarkdown"
                    class="px-6 py-3 bg-slate-600 text-white rounded hover:bg-slate-700"
                  >Load Markdown for suspected pages containing table</button>
                  <p v-else-if="isLoadingMarkdown" class="flex items-center justify-center h-full text-gray-500">Loading Markdown...</p>
                </div>
                <div v-else v-html="markdownContent" class="prose max-w-none"></div>
              </div>
              
              <!-- PDF content -->
              <div v-if="activeTab === 'pdf'" class="h-full">
                <div v-if="pdfUrl" class="w-full h-full">
                  <object :data="pdfUrl" type="application/pdf" class="w-full h-full"></object>
                </div>
                <div v-else class="flex items-center justify-center h-full text-gray-500">
                  Click "Full PDF" tab to load
                </div>
              </div>
            </div>

            <!-- Row 4: Input and submit -->
            <div class="flex gap-2 p-4 border-t border-gray-300 h-[10%] shrink-0 items-center bg-white">
                <input 
                  v-model="userInput"
                  type="text" 
                  :placeholder="`Enter value for ${selectedItem.data_point}`"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <BaseButton @click="submitValue" intent="primary">Submit</BaseButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
