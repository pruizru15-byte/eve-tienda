import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface WeeklyProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  specs: string[];
}

export interface WeeklyResponse {
  categoryName: string;
  products: WeeklyProduct[];
}

export const useWeeklyBestSellers = () => {
  return useQuery<WeeklyResponse>({
    queryKey: ['weekly-best-sellers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/public/products/weekly-best-sellers`);
      if (!res.ok) throw new Error("Error al obtener los más vendidos de la semana");
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hora de cache ya que es semanal
  });
};
