import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface VanguardFeature {
  id: string;
  icon_name: string;
  title: string;
  description: string;
}

export interface VanguardData {
  id: string;
  badge_top: string;
  title: string;
  quote_text: string;
  author_name: string;
  author_role: string;
  main_image_url: string;
  image_badge_text: string;
  features: VanguardFeature[];
}

export const useVanguardData = () => {
  return useQuery<VanguardData>({
    queryKey: ['vanguard-data'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/vanguard`);
      if (!res.ok) throw new Error("Error fetching vanguard data");
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};
