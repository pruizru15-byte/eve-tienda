import { useState, useEffect, useCallback } from 'react';
import { IService, IServiceCategory, IServiceFilters } from '../domain/models';
import { servicesApi } from '../services/services.api';

/**
 * Capa de Aplicación - Custom Hook
 * Maneja el estado de los filtros, la carga, errores y la lógica de búsqueda.
 * Orquestas las llamadas al servicio de infraestructura.
 */
export const useServices = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [categories, setCategories] = useState<IServiceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [filters, setFilters] = useState<IServiceFilters>({
    search: '',
    categoryId: 'all', // Valor 'all' para mostrar todos
    maxPrice: 5000, // Precio máximo por defecto
  });

  /**
   * Cargar categorías al inicio
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await servicesApi.getCategories();
        setCategories(data);
      } catch (err: any) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  /**
   * Orquestar la obtención de servicios de forma reactiva
   */
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicesApi.search({
        search: filters.search,
        categoryId: filters.categoryId === 'all' ? undefined : filters.categoryId,
        maxPrice: filters.maxPrice,
      });
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Efecto reactivo a los cambios en los filtros con Debounce para el texto
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 400); // Debounce de 400ms

    return () => clearTimeout(timer);
  }, [fetchServices]);

  /**
   * Handlers para actualizar filtros
   */
  const updateSearch = (text: string) => setFilters(f => ({ ...f, search: text }));
  const updateCategory = (id: string) => setFilters(f => ({ ...f, categoryId: id }));
  const updateMaxPrice = (price: number) => setFilters(f => ({ ...f, maxPrice: price }));

  return {
    services,
    categories,
    loading,
    error,
    filters,
    updateSearch,
    updateCategory,
    updateMaxPrice,
    refresh: fetchServices
  };
};
