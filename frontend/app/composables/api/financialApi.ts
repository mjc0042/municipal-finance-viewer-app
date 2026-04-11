import { apiClient } from '@/composables/api/apiClient';
import type { ErrorResponse } from '~/types/http/common';
import type { MunicipalFeature, StateBoundary, ParcelUploadResponse } from '~/types/http/gis';
import type { MunicipalityFinance, MunicipalityInfo } from '~/types/http/finance';

export const financialApi = {
  getMunicipalityFinances: async (mid: string) => {
    const response = await apiClient.get<MunicipalityFinance[]>(
      `/financial/municipality/finances`,
      { params: { mid } }
    );
    return response.data;
  },
  getMunicipalityList: async () => {
    const response = await apiClient.get<MunicipalityInfo[]>(
      `/financial/municipality/list`
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
  },
  uploadParcelData: async (file: File, mid:string):Promise<ParcelUploadResponse | ErrorResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(
      `/financial/gis/municipality/parcels`,
      formData,
      { 
        params: { mid },
        headers: { 'Content-Type': 'multipart/form-data' },
        maxContentLength: 10000000 // 10MB
      }
    );
    return response.data;
  }
};