import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface TemptingOffer {
  id: string;
  product_id: string;
  subtitle: string;
  title: string;
  button_text: string;
  image_url: string;
  is_active: boolean;
  clicks: number;
  conversions: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export const useTemptingOffers = () => {
  return useQuery<TemptingOffer[]>({
    queryKey: ['tempting-offers-public'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/tempting-offers`);
      if (!res.ok) throw new Error("Error al obtener cosas tentadoras");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const trackTemptingOfferClick = async (id: string) => {
  try {
    await fetch(`${API_URL}/tempting-offers/${id}/click`, { method: 'POST' });
  } catch (error) {
    console.error("Error tracking click:", error);
  }
};

export const trackTemptingOfferConversion = async (id: string) => {
  try {
    await fetch(`${API_URL}/tempting-offers/${id}/conversion`, { method: 'POST' });
  } catch (error) {
    console.error("Error tracking conversion:", error);
  }
};
