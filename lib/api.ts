import { ApiResponse, Club, Chapter, Member } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Enable caching for GET requests
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // Disable caching for POST requests
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};

// Specific API functions
export const clubsApi = {
  getAll: async (): Promise<Club[]> => {
    const response: ApiResponse<Club> = await api.get('/api/clubs/');
    return response.results;
  },
  getById: async (id: string): Promise<Club> => {
    return await api.get(`/api/clubs/${id}/`);
  },
};

export const chaptersApi = {
  getByClub: async (clubId: string | number): Promise<Chapter[]> => {
    const response: ApiResponse<Chapter> = await api.get(`/api/chapters/?club=${clubId}`);
    return response.results;
  },
  getById: async (id: string): Promise<Chapter> => {
    return await api.get(`/api/chapters/${id}/`);
  },
};

export const membersApi = {
  getByChapter: async (chapterId: string | number): Promise<Member[]> => {
    const response: ApiResponse<Member> = await api.get(`/api/members/?chapter=${chapterId}`);
    return response.results;
  },
  getById: async (id: string): Promise<Member> => {
    return await api.get(`/api/members/${id}/`);
  },
};

export const eventsApi = {
  getAll: () => api.get('/api/events/'),
  getById: (id: string) => api.get(`/api/events/${id}/`),
};
