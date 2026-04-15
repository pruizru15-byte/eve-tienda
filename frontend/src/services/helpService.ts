const API_URL = 'http://localhost:3000/api';

export interface HelpSection {
  id: string;
  title: string;
  description: string;
  content: string;
  is_active: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export const helpService = {
  // Public
  getPublicSections: async (): Promise<HelpSection[]> => {
    const response = await fetch(`${API_URL}/help`);
    if (!response.ok) throw new Error('Error al cargar secciones de ayuda');
    return response.json();
  },

  // Admin
  getAllSections: async (): Promise<HelpSection[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/help`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Error al cargar secciones para admin');
    return response.json();
  },

  createSection: async (data: Omit<HelpSection, 'id'>): Promise<HelpSection> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/help`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear sección');
    return response.json();
  },

  updateSection: async (id: string, data: Partial<HelpSection>): Promise<HelpSection> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/help/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar sección');
    return response.json();
  },

  deleteSection: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/help/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Error al eliminar sección');
  },

  acceptTerms: async (): Promise<any> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para aceptar los términos');

    const response = await fetch(`${API_URL}/auth/accept-terms`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al aceptar términos');
    }
    return response.json();
  }
};
