import { apiClient } from '@/composables/api/apiClient';
import type { StateBoundary } from '~/types/http/gis';
import type { MunicipalityFinance } from '~/types/http/finance';

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
    return geojsonObj.features
  },
  getMunicipalBoundaries: async (name:string, abbr:string, code:string) => {
    const response = await apiClient.get(
      `/financial/gis/municipalities`,
      { params: { "state_name":name, "state_abbr":abbr, "state_code":code } }
    );
    return response.data;
  },
  addMunicipalityYearlyFinances: async (data: any) => {
    const response = await apiClient.post(`/financial/municipality/finances/add/year`, data);
    return response.data;
  }
};