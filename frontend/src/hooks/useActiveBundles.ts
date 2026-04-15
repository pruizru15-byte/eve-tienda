import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface BundleProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export interface BundleItem {
  id: string;
  order_index: number;
  product: BundleProduct;
}

export interface Bundle {
  id: string;
  title: string;
  image_url: string;
  items: BundleItem[];
}

export const useActiveBundles = () => {
  return useQuery<Bundle[]>({
    queryKey: ['active-bundles'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/public/bundles/active`);
      if (!res.ok) throw new Error("Error al obtener los ecosistemas interactivos");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });
};
