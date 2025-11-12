import type { CrossSectionPanel } from '@/lib/designerUtils';
import { apiClient } from '../api';
import type { DesignTemplate } from './types';

export const designerApi = {
  getTemplates: async () => {
    const response = await apiClient.get<DesignTemplate[]>('/design/templates');
    return response.data;
  },

  createTemplate: async (template: Omit<DesignTemplate, 'id'>) => {
    const response = await apiClient.post<DesignTemplate>('/design/templates', template);
    return response.data;
  },
  generateCrossSectionImage: async(units:string, theme:string, panels:CrossSectionPanel[]) => {
    const response = await apiClient.get('/design/cross-section/generate', {
      params: { units, theme, sections: JSON.stringify(panels) },
      paramsSerializer: params => {
        return Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
      }
    });
    return response.data.image;
  },
  saveImage: async(imageId: number) => {
    const response = await apiClient.post(`/design/cross-section/${imageId}/save`);
    return response.data;
  }
};