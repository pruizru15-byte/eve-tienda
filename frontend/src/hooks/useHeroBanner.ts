import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface HeroProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  description: string;
  categoryId: string;
  category?: { name: string };
  isHeroCarousel: boolean;
  features?: string[];
}

export interface HeroResponse {
  mode: "AUTO" | "MANUAL";
  products: HeroProduct[];
}

export const useHeroBanner = () => {
  return useQuery<HeroResponse>({
    queryKey: ['hero-products'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/public/hero-products`);
      if (!res.ok) throw new Error("Error obteniendo hero products");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminHeroSettings = () => {
  return useQuery({
    queryKey: ['admin-hero-settings'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/hero/settings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error("Error obteniendo hero settings");
      return res.json();
    }
  });
};

export const useUpdateHeroMode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (mode: "AUTO" | "MANUAL") => {
            const res = await fetch(`${API_URL}/admin/hero/mode`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ hero_mode: mode })
            });
            if (!res.ok) throw new Error("Error actualizando hero mode");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-hero-settings'] });
            queryClient.invalidateQueries({ queryKey: ['hero-products'] });
        }
    });
};

export const useToggleProductHero = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, isHero }: { id: string, isHero: boolean }) => {
            const res = await fetch(`${API_URL}/admin/products/${id}/hero-carousel`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ is_hero_carousel: isHero })
            });
            if (!res.ok) throw new Error("Error actualizando carrusel");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero-products'] });
            // Deberiamos invalidar tambíen la lista de productos del admin si se usa cache ahi
        }
    });
};
