import { ApiResponse, Club, Chapter, Member } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const api = {
  async get(endpoint: string, authToken?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      // Enable caching for GET requests
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async post(endpoint: string, data: any, authToken?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
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
  create: async (clubData: FormData, authToken: string): Promise<Club> => {
    const response = await fetch(`${API_BASE_URL}/api/clubs/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: clubData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw { status: response.status, data: errorData };
    }

    return response.json();
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
  create: async (chapterData: any, authToken: string): Promise<Chapter> => {
    const response = await fetch(`${API_BASE_URL}/api/chapters/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(chapterData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw { status: response.status, data: errorData };
    }

    return response.json();
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
  create: async (memberData: FormData, authToken: string): Promise<Member> => {
    const response = await fetch(`${API_BASE_URL}/api/members/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: memberData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw { status: response.status, data: errorData };
    }

    return response.json();
  },
};

export const eventsApi = {
  getAll: () => api.get('/api/events/'),
  getById: (id: string) => api.get(`/api/events/${id}/`),
};

export const dashboardApi = {
  getOverview: async (authToken: string) => {
    return await api.get('/api/dashboard/overview/', authToken);
  },
};
