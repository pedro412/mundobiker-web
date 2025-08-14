// Authentication utility functions for JWT token management

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_joined: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  message: string;
}

// Check if user is authenticated (has valid access token)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const accessToken = localStorage.getItem('access');
  if (!accessToken) return false;
  
  try {
    // Decode JWT payload (without verification - just to check expiration)
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return false;
  }
};

// Get current user data from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get access token
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access');
};

// Get refresh token
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh');
};

// Clear all authentication data
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  
  // Dispatch custom event to notify components of auth change
  window.dispatchEvent(new Event('authChange'));
};

// Refresh access token using refresh token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/jwt-refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('access', data.access);
        // Dispatch custom event to notify components of auth change
        window.dispatchEvent(new Event('authChange'));
        return data.access;
      }
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
  
  // If refresh fails, logout user
  logout();
  return null;
};

// Make authenticated API request with automatic token refresh
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let accessToken = getAccessToken();
  
  // If no access token or expired, try to refresh
  if (!accessToken || !isAuthenticated()) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      throw new Error('Authentication required');
    }
  }
  
  // Add authorization header
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  };
  
  const response = await fetch(url, authOptions);
  
  // If unauthorized and we have a refresh token, try to refresh and retry
  if (response.status === 401 && getRefreshToken()) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      authOptions.headers = {
        ...authOptions.headers,
        'Authorization': `Bearer ${newAccessToken}`,
      };
      return fetch(url, authOptions);
    }
  }
  
  return response;
};
