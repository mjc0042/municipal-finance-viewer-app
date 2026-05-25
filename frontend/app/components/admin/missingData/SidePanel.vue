<script setup lang="ts">
import { ref } from 'vue'
import { financialApi } from '~/composables/api/financialApi'
import type { MissingData } from '~/types/http/missingData'

const props = defineProps<{
  selectedItem: MissingData
}>()

const emit = defineEmits<{
  onClose: []
}>()

const markdownContent = ref<string>('')
const isLoadingMarkdown = ref(false)
const userInput = ref<string>('')
const pdfUrl = ref<string>('')
const isLoadingPdf = ref(false)
const activeTab = ref<'markdown' | 'pdf'>('markdown')

const activeSection = ref<'correctPdf' | 'updateValue' | 'closeIssue' | null>(null)
const pdfStartPage = ref<number | null>(null)
const pdfEndPage = ref<number | null>(null)
const updateValue = ref<string>('')

onMounted(async () => {})

async function loadMarkdown() {
  if (!props.selectedItem) return
  
  isLoadingMarkdown.value = true
  
  try {
    markdownContent.value = await financialApi.getMissingDataPdfSegment(
      props.selectedItem.municipality_id,
      props.selectedItem.year,
      props.selectedItem.pdf_page_indices[0] + ',' + props.selectedItem.pdf_page_indices[1]
    )
  } catch (ex: any) {
    markdownContent.value = `Error loading PDF content: ${ex.response?.data?.error || ex.message}`
  } finally {
    isLoadingMarkdown.value = false
  }
}

function closePanel() {
  markdownContent.value = ''
  pdfUrl.value = ''
  emit('onClose')
}

function submitValue() {
  console.log('Submitting:', { item: props.selectedItem, value: userInput.value })
}

async function loadFullPdf() {
  if (!props.selectedItem) return
  
  activeTab.value = 'pdf'
  isLoadingPdf.value = true
  pdfUrl.value = ''
  
  try {
    const response = await financialApi.getMissingDataFullPDF(
      props.selectedItem.municipality_id,
      props.selectedItem.year
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

function toggleSection(section: 'correctPdf' | 'updateValue' | 'closeIssue') {
  if (activeSection.value === section) return;
  activeSection.value = activeSection.value === section ? null : section
}

async function runCorrectPdf() {
  if (!pdfStartPage.value || ! pdfEndPage.value) return

  try {
    await financialApi.updateMissingDataPages(props.selectedItem, pdfStartPage.value, pdfEndPage.value)
  } catch (ex:any) {
    console.log(ex)
  }
}

function submitUpdateValue() {
  console.log('Submitting update value:', updateValue.value)
  // TODO: Implement value submission
}

function closeIssue() {
  console.log('Closing issue:', props.selectedItem.gap_id)
  // TODO: Implement close issue logic
}

function getSectionClasses(section: 'correctPdf' | 'updateValue' | 'closeIssue') {
  const isActive = activeSection.value === section
  const isInactive = activeSection.value !== null && !isActive
  
  return {
    'flex-1 p-2 cursor-pointer transition-all duration-300': true,
    'flex-2 bg-white': !isInactive,
    'text-gray-100 opacity-60': isInactive
  }
}
</script>

<template>
<div class="w-1/2 border-l border-gray-300 flex flex-col bg-gray-50" style="height: 100vh;">
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

    <!-- Row 4: Update Functionality -->
    <div class="h-[15%] shrink-0 bg-white border-y border-gray-300 p-2 flex gap-2 items-stretch">
        
        <!-- Correct PDF Pages Section -->
        <div 
          :class="getSectionClasses('correctPdf')"
          @click="toggleSection('correctPdf')"
        >
          <div v-if="activeSection !== 'correctPdf'" class="h-full flex items-center justify-center font-medium text-gray-700 hover:text-secondary-500">
            Correct PDF Pages
          </div>
          <div v-else class="h-full flex items-center justify-center gap-2">
            <input 
              v-model.number="pdfStartPage"
              type="number" 
              placeholder="Start"
              class="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <input 
              v-model.number="pdfEndPage"
              type="number" 
              placeholder="End"
              class="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <BaseButton 
              @click.stop="runCorrectPdf"
              intent="primary"
              class="px-3 py-1 text-sm"
            >
              Run
            </BaseButton>
          </div>
        </div>

        <!-- Update Value Section -->
        <div
          class="border-x border-gray-300"
          :class="getSectionClasses('updateValue')"
          @click="toggleSection('updateValue')"
        >
          <div v-if="activeSection !== 'updateValue'" class="h-full flex items-center justify-center font-medium text-gray-700 hover:text-secondary-500">
            Update Value
          </div>
          <div v-else class="h-full flex items-center justify-center gap-2">
            <input 
              v-model="updateValue"
              type="text" 
              :placeholder="`Enter value`"
              class="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <BaseButton
              intent="primary"
              @click.stop="submitUpdateValue"
              class="px-3 py-1 text-sm"
            >
              Submit
            </BaseButton>
          </div>
        </div>

        <!-- Close Issue Section -->
        <div
          :class="getSectionClasses('closeIssue')"
          @click="toggleSection('closeIssue')"
        >
          <div v-if="activeSection !== 'closeIssue'" class="h-full flex items-center justify-center font-medium text-gray-700 hover:text-secondary-500">
            Close Issue
          </div>
          <div v-else class="h-full flex items-center justify-center">
            <BaseButton
              intent="secondary" 
              @click.stop="closeIssue"
              class="px-4 py-2 text-sm"
            >
              Close Issue
            </BaseButton>
          </div>
        </div>
      </div>
</div>
</template>

<style scoped>
</style>
