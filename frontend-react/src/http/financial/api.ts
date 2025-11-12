import { apiClient } from '../api';
import type { StateBoundary } from './types/gis';
import type { MunicipalityFinance } from './types/types';

export const financialApi = {
  getMunicipalityFinances: async (mid: string) => {
    const response = await apiClient.get<MunicipalityFinance[]>(
      `/financial/municipality/finances`,
      { params: { mid } }
    );
    return response.data;
  },
  getStateBoundaries: async () => {
    const response = await apiClient.get(`/financial/gis/states`);
    const geojsonObj = JSON.parse(response.data);
    const stateBoundaries: StateBoundary[] = geojsonObj.features.map((feature: any) => feature.properties);
    return stateBoundaries;
  },
  getMunicipalBoundaries: async (name:string, abbr:string, code:string) => {
    performance.mark('mark-start');
    const response = await apiClient.get(
      `/financial/gis/municipalities`,
      { params: { "state_name":name, "state_abbr":abbr, "state_code":code } }
    );
    performance.mark('mark-end');
    performance.measure('getMunicipalBoundaries', 'mark-start', 'mark-end');
    const measures = performance.getEntriesByName('getMunicipalBoundaries');
    if (measures.length > 0) {
        console.log(`API call to getMunicipalBoundaries took ${measures[0].duration} ms`);
    }
    performance.clearMarks();
    performance.clearMeasures();
    return response.data;
  },
  addMunicipalityYearlyFinances: async (data: any) => {
    const response = await apiClient.post(`/financial/municipality/finances/add/year`, data);
    return response.data;
  }
};