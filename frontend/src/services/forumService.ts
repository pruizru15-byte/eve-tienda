const API_URL = 'http://localhost:3000/api';

export const forumService = {
  getTopics: async () => {
    const response = await fetch(`${API_URL}/forum/topics`);
    if (!response.ok) throw new Error('Error al cargar temas');
    return response.json();
  },

  createPost: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/forum/topics`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al crear post');
    return data;
  }
};
