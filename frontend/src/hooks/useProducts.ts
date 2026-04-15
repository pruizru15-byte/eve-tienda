import { useQuery } from "@tanstack/react-query";
import { Product } from "@/domain/types";

// Base URL for API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const fetchProducts = async (query: string): Promise<Product[]> => {
  const res = await fetch(`${API_URL}/public/products?${query}`);
  if (!res.ok) throw new Error("Error fetching products from backend.");
  return res.json();
};

export const useFeaturedProducts = (limit: number = 4) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => fetchProducts(`featured=true&limit=${limit}`),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBestSellers = (categoryName: string, limit: number = 4) => {
  return useQuery({
    queryKey: ['products', 'bestsellers', categoryName, limit],
    queryFn: () => fetchProducts(`categoryName=${categoryName}&sortBy=rating&sortOrder=desc&limit=${limit}`),
    staleTime: 1000 * 60 * 5,
  });
};
