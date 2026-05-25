import { apiClient } from '@/composables/api/apiClient';
import type { User } from '~/types/http/auth';
import type { ErrorResponse } from '~/types/http/common';
import type { ParcelUploadResponse } from '~/types/http/gis';
import type { MunicipalityFinance, MunicipalityInfo } from '~/types/http/finance';
import type { MissingData } from '~/types/http/missingData';


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
  },
  getMissingFinanceData: async () => {
    const response = await apiClient.get<MissingData[]>(`/financial/admin/missing-data`);
    return response.data;
  },
  getMissingDataPdfSegment: async (mid:string, year:number, pages:string) => {
    const response = await apiClient.get(`/financial/admin/missing-data/pdf-segment`, {
      params: { mid, year, pages }
    });
    return response.data;
  },
  getMissingDataFullPDF: async (mid: string, year: number) => {
    const response = await apiClient.get(`/financial/admin/missing-data/pdf-full`, {
      params: { mid, year },
      responseType: 'blob'
    });
    //const runtimeConfig = useRuntimeConfig();
    //return `${runtimeConfig.public.apiBase}${response.data.url}`;
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  },
  updateMissingDataValue: async (missingData: MissingData, newValue: string, newStatus: string) => {
    const response = await apiClient.post(`/financial/admin/missing-data/update/value`, {
      mid: missingData.municipality_id,
      gapid: missingData.gap_id,
      year: missingData.year,
      field: missingData.data_point,
      status: newStatus,
      value: newValue
    });
    return response.data;
  },
  closeMissingData: async (missingData: MissingData) => {
    const response = await apiClient.post(`/financial/admin/missing-data/close`, {
      mid: missingData.municipality_id,
      gapid: missingData.gap_id
    });
    return response.data;
  },
  updateMissingDataPages: async (missingData:MissingData, page_start:number, page_end:number) => {
    const response = await apiClient.post(`/financial/admin/missing-data/update/pages`, {
      mid: missingData.municipality_id,
      gapid: missingData.gap_id,
      year: missingData.year,
      field: missingData.data_point,
      pages: `${page_start},${page_end}`
    });
    return response.data;
  }
};