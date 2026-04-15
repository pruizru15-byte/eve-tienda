import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface Offer {
  id: string;
  product_id: string | null;
  title: string;
  description: string;
  discount: number;
  image_url: string | null;
  end_date: string;
  is_active: boolean;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    rating: number;
    reviews_count: number;
    image_url: string;
    category: {
      id: string;
      name: string;
    }
  } | null;
}

export const useActiveOffers = () => {
  return useQuery<Offer[]>({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/public/offers/active`);
      if (!res.ok) throw new Error("Error al obtener las mejores ofertas");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutos para ofertas
  });
};
