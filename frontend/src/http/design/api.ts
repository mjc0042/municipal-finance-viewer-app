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
  }
};