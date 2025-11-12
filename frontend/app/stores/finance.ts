import { defineStore } from 'pinia'
import { financialApi } from '@/composables/api/financialApi'
import type { StateBoundary, MunicipalFeature, MunicipalBoundaryCollection } from '@/types/http/gis'
import type { MunicipalityFinance } from '@/types/http/finance'
import type { StateInfo } from '@/types/store/finance'
import { FrameType } from '@/types/store/frames'

interface FinanceState {
  selectedStatesByFrame: Record<string, StateInfo | null>
  municipalBoundariesByState: Record<number, MunicipalBoundaryCollection | null>
  selectedMunicipalitiesByFrame: Record<string, MunicipalFeature | null>
  frameMidMap: Record<string, string>
  financesByMunicipality: Record<string, MunicipalityFinance[] | null>
  searchQuery: string;
}

export const useFinanceStore = defineStore('finance', {
  state: (): FinanceState => ({
    selectedStatesByFrame: {},
    municipalBoundariesByState: {},
    selectedMunicipalitiesByFrame: {},
    frameMidMap: {},
    financesByMunicipality: {},
    searchQuery: '',
  }),
  actions: {
    async setSelectedState(frameId: string, stateName: string, abbr: string, code: string) {
      const boundaries = await financialApi.getMunicipalBoundaries(stateName, abbr, code)
      this.municipalBoundariesByState[Number(code)] = boundaries
      this.selectedStatesByFrame[frameId] = { name: stateName, abbr, code: code }
    },
    removeFrameData(frameId: string, type: FrameType | undefined) {
      // If type is undefined check both selectedStatesByFrame and selectedMunicipalitiesByFrame
      if (!type || type === FrameType.MapState || type === FrameType.MapUS) {
        if (this.selectedStatesByFrame[frameId]) {
          delete this.selectedStatesByFrame[frameId]
        }
      }
      if (!type || type === FrameType.MapMunicipal) {
        if (this.selectedMunicipalitiesByFrame[frameId]) {
          delete this.selectedMunicipalitiesByFrame[frameId]
        }
      }
      if (!type || type === FrameType.FinanceInfo) {
        if (this.frameMidMap[frameId]) {
          delete this.frameMidMap[frameId]
        }
      }
    },
    getSelectedState(frameId: string): StateInfo | null {
      return this.selectedStatesByFrame[frameId] ?? null
    },
    getStateMunicipalBoundariesList(stateCode: string): MunicipalFeature[] {
      return this.municipalBoundariesByState[Number(stateCode)]?.features ?? []
    },
    getSelectedMunicipality(frameId: string): MunicipalFeature | null {
      return this.selectedMunicipalitiesByFrame[frameId] ?? null
    },
    async setSelectedMunicipality(frameId: string, stateCode:string, featureId: number, mid: string) {
      // Set municipal boundary for frame
      this.selectedMunicipalitiesByFrame[frameId] = this.municipalBoundariesByState[Number(stateCode)]?.features
        .find(f => f.id === featureId) ?? null

      // Get finances for the municipality
      if (!this.financesByMunicipality[mid]) {
        this.financesByMunicipality[mid] = await financialApi.getMunicipalityFinances(mid)
      }
    },
    addMunicipalFinancesForFrame(frameId: string, mid: string) {
      this.frameMidMap[frameId] = mid
    },
    getMunicipalFinancesByFrame(frameId: string): MunicipalityFinance[] | null {
      if (this.frameMidMap[frameId]) {
        return this.getMunicipalFinancesByMid(this.frameMidMap[frameId]) ?? null
      }
      return null
    },
    getMunicipalFinancesByMid(mid: string): MunicipalityFinance[] | null {
      return this.financesByMunicipality[mid] ?? null
    },
    setSearchQuery(query: string) {
      this.searchQuery = query;
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.sessionStorage()
  }
})
