const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface CompanySettings {
  id: string;
  about_innovation: string;
  about_team: string;
  about_mission: string;
  about_values: string;
  about_innovation_text: string;
  about_team_text: string;
  about_mission_text: string;
  about_values_text: string;
  contact_email: string;
  contact_phone: string;
  contact_location: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_linkedin: string;
  social_github: string;
  target_email?: string;
  custom_project_title?: string;
  custom_project_text?: string;
  whatsapp_main_number?: string;
}

export const getCompanySettings = async (): Promise<CompanySettings> => {
  const response = await fetch(`${API_URL}/settings/company`);
  if (!response.ok) throw new Error('Error al cargar la configuración');
  return response.json();
};

export const updateCompanySettings = async (data: Partial<CompanySettings>, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/settings/company`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar configuración');
  }
  return response.json();
};

export const sendContactMessage = async (data: { name: string, email: string, message: string }, token?: string): Promise<any> => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al enviar mensaje');
  }
  return response.json();
};
