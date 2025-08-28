import { apiClient } from '../api';
import type { MunicipalBoundary, StateBoundary } from './types/gis';
import type { MunicipalityFinance, MunicipalityFinanceParams } from './types/types';

export const financialApi = {
  getMunicipalityFinances: async ({ name, state }: MunicipalityFinanceParams) => {
    const response = await apiClient.get<MunicipalityFinance>(
      `/financial/municipality/finances`,
      { params: { name, state } }
    );
    return response.data;
  },
  getStateBoundaries: async () => {
    const response = await apiClient.get(`/financial/gis/states`);
    const geojsonObj = JSON.parse(response.data);
    const stateBoundaries: StateBoundary[] = geojsonObj.features.map((feature: any) => feature.properties);
    return stateBoundaries;
  },
  getMunicipalBoundaries: async (state:string) => {
    const response = await apiClient.get(
      `/financial/gis/municipalities`,
      { params: { state } }
    );
    return response.data;
  },

  initSampleData: async () => {
    const response = await apiClient.post('/financial/init-sample-data');
    return response.data;
  }
};