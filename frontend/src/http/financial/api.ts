import { apiClient } from '../api';
import type { MunicipalityFinance, MunicipalityFinanceParams } from './types';

export const financialApi = {
  getMunicipalityFinances: async ({ name, state }: MunicipalityFinanceParams) => {
    const response = await apiClient.get<MunicipalityFinance>(
      `/financial/municipality/finances`,
      { params: { name, state } }
    );
    return response.data;
  },

  initSampleData: async () => {
    const response = await apiClient.post('/financial/init-sample-data');
    return response.data;
  }
};