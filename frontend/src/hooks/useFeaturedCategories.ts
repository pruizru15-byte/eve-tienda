import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  is_active: boolean;
  _count?: {
    products: number;
  };
}

export const useFeaturedCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['featured-categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/categories/featured`);
      if (!res.ok) throw new Error("Error fetching featured categories");
      return res.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
};
