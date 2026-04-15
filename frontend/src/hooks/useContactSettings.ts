import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface ContactSettings {
  support_email: string;
  email_subtext: string;
  phone: string;
  phone_subtext: string;
  address_line1: string;
  address_line2: string;
  linkedin_url: string;
  twitter_url: string;
  github_url: string;
}

export const useContactSettings = () => {
  return useQuery<ContactSettings>({
    queryKey: ['contact-settings'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/contact-settings`);
      if (!res.ok) throw new Error("Error fetching contact settings");
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
