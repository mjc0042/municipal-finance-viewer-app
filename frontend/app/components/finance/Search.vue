<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { financialApi } from '@/composables/api/financialApi'
import type { MunicipalityInfo } from '@/types/http/finance'
import type { SearchMunicipalityEvent } from '@/types/events/selectMunicipalityEvent'

const emit = defineEmits<{
  (e: 'searchMunicipality', event: SearchMunicipalityEvent): void
}>()

const expanded = ref(false)
const searchTerm = ref('')
const showDropdown = ref(false)
const municipalities = ref<MunicipalityInfo[]>([])

onMounted(async () => {
  try {
    municipalities.value = await financialApi.getMunicipalityList()
  } catch (e) {
    console.error('Failed to fetch municipality list', e)
  }
})

function getDisplayLabel(muni: MunicipalityInfo): string {
  const fips = muni.county_fips || ''
  return `${muni.name} ${muni.state} ${fips}`.trim()
}

const filteredMunicipalities = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  if (!query) return []
  return municipalities.value
    .filter(m => getDisplayLabel(m).toLowerCase().includes(query))
    .slice(0, 10) // Limit dropdown to 10 results
})

function highlightMatch(text: string, query: string) {
  if (!query) return [{ text, bold: false }]
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const segments: { text: string; bold: boolean }[] = []
  let lastIndex = 0
  let idx = lowerText.indexOf(lowerQuery)

  while (idx !== -1) {
    if (idx > lastIndex) {
      segments.push({ text: text.slice(lastIndex, idx), bold: false })
    }
    segments.push({ text: text.slice(idx, idx + query.length), bold: true })
    lastIndex = idx + query.length
    idx = lowerText.indexOf(lowerQuery, lastIndex)
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false })
  }
  return segments
}

function onSelect(municipality: MunicipalityInfo) {
  emit('searchMunicipality', {
    municipalityInfo: municipality
  });
  searchTerm.value = ''
  showDropdown.value = false
  expanded.value = false
}

function onFocus() {
  expanded.value = true
  showDropdown.value = true
}

function onBlur() {
  // Delay to allow click events on dropdown items
  setTimeout(() => {
    showDropdown.value = false
    expanded.value = false
  }, 200)
}

function onMouseLeave() {
  if (!showDropdown.value) {
    expanded.value = false
  }
}
</script>

<template>
  <div
    class="relative m-2 flex justify-center items-center p-2 bg-white rounded-xs drop-shadow-xl/25 transition-[width] duration-300 ease-in-out z-50"
    :class="{ 'w-65': expanded, 'w-10': !expanded }"
    @mouseenter="expanded = true"
    @mouseleave="onMouseLeave"
  >
    <Icon name="carbon:search" size="24" class="text-gray-600"/>
    <input
      v-if="expanded"
      v-model="searchTerm"
      type="text"
      placeholder="Search municipalities..."
      class="w-full outline-none bg-white caret-zinc-800 ml-2"
      @focus="onFocus"
      @blur="onBlur"
      spellcheck="false"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
    />

    <!-- Dropdown -->
    <div
      v-if="expanded && showDropdown && filteredMunicipalities.length > 0"
      class="absolute top-full left-0 mt-1 w-80 bg-white rounded-md shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50"
    >
      <div
        v-for="muni in filteredMunicipalities"
        :key="muni.mid"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
        @mousedown="onSelect(muni)"
      >
        <template v-for="(segment, sIdx) in highlightMatch(getDisplayLabel(muni), searchTerm)" :key="sIdx">
          <span v-if="segment.bold" class="font-bold text-black">{{ segment.text }}</span>
          <span v-else class="text-gray-700">{{ segment.text }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
