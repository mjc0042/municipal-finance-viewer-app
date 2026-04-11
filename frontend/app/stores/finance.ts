import { defineStore } from 'pinia'
import { financialApi } from '@/composables/api/financialApi'
import type { ErrorResponse } from '@/types/http/common'
import type { MunicipalFeature, MunicipalBoundaryCollection, ParcelUploadResponse } from '@/types/http/gis'
import type { MunicipalityFinance } from '@/types/http/finance'
import type { StateInfo } from '@/types/store/finance'
import { FrameType } from '@/types/store/frames'
import type { List } from 'echarts'

interface FinanceState {
  selectedStatesByFrame: Record<string, StateInfo | null>
  municipalBoundariesByState: Record<number, MunicipalBoundaryCollection | null>
  selectedMunicipalitiesByFrame: Record<string, MunicipalFeature | null>
  frameMidMap: Record<string, string>
  financesByMunicipality: Record<string, MunicipalityFinance[] | null>
  searchQuery: string;
  municipalParcelDataByFrame: Record<string, any>
}

export const useFinanceStore = defineStore('finance', {
  state: (): FinanceState => ({
    selectedStatesByFrame: {},
    municipalBoundariesByState: {},
    selectedMunicipalitiesByFrame: {},
    frameMidMap: {},
    financesByMunicipality: {},
    searchQuery: '',
    municipalParcelDataByFrame: {}
  }),
  actions: {
    async getStateMunicipalBoundaries(stateName: string, abbr: string, code: string): Promise<MunicipalBoundaryCollection | null> {
      if (!this.municipalBoundariesByState[Number(code)]) {
        const boundaries = await financialApi.getMunicipalBoundaries(stateName, abbr, code)
        this.municipalBoundariesByState[Number(code)] = boundaries
      }
      return this.municipalBoundariesByState[Number(code)] ?? null
    },
    async setSelectedState(frameId: string, stateName: string, abbr: string, code: string) {
      await this.getStateMunicipalBoundaries(stateName, abbr, code)
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
    },
    async addParcelDataForFrame(
      frameId: string,
      file: File,
      mid: string | null,
      municipalityGisData: MunicipalFeature | null): Promise<ParcelUploadResponse | ErrorResponse> {

      if (!frameId || frameId === '') {
        throw new Error('Frame ID is required to add parcel data')
      }

      if (mid == undefined || mid == null || mid === '') {
        mid = this.frameMidMap[frameId] ?? ''
      }

      if (municipalityGisData == undefined || municipalityGisData == null) {
        municipalityGisData = this.selectedMunicipalitiesByFrame[frameId] ?? null
      }
      
      // Send parcel data to API to get modified GIS data for the municipality
      const data = await financialApi.uploadParcelData(file, mid)
      console.log('Received processed parcel data:', data)
      this.municipalParcelDataByFrame[frameId] = data
      return data
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.sessionStorage(),
    omit: [ 'municipalParcelDataByFrame' ],
    debug: true
  }
})
