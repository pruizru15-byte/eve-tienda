import { apiRequest } from '../lib/api';
import { IService, IServiceCategory } from '../domain/models';

/**
 * Capa de Infraestructura - Servicio API
 * Aísla las llamadas HTTP a los endpoints.
 */
export const servicesApi = {
  /**
   * Obtiene todos los servicios (públicos)
   * Se asume que el backend tiene un endpoint público para esto.
   */
  getAll: async (): Promise<IService[]> => {
    return apiRequest('/public/services');
  },

  /**
   * Obtiene todas las categorías de servicios
   */
  getCategories: async (): Promise<IServiceCategory[]> => {
    return apiRequest('/public/services/categories');
  },

  /**
   * Obtiene servicios filtrados (opcional, si se prefiere filtrar en backend)
   * Para este ejercicio, el hook filtrará en memoria para mayor reactividad
   * o se puede usar este método si el backend soporta query params.
   */
  search: async (filters: { 
    search?: string; 
    categoryId?: string; 
    maxPrice?: number 
  }): Promise<IService[]> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('q', filters.search);
    if (filters.categoryId) params.append('category', filters.categoryId);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    return apiRequest(`/public/services?${params.toString()}`);
  }
};
