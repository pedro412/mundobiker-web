'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  use,
} from 'react';
import { useRouter } from 'next/navigation';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_joined: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tokens: {
    access: string | null;
    refresh: string | null;
  };
  error: string | null;
}

// Action types
export type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; access: string; refresh: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE_USER'; payload: User }
  | { type: 'TOKEN_REFRESH'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tokens: {
    access: null,
    refresh: null,
  },
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        tokens: {
          access: action.payload.access,
          refresh: action.payload.refresh,
        },
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: {
          access: null,
          refresh: null,
        },
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: {
          access: null,
          refresh: null,
        },
        error: null,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'TOKEN_REFRESH':
      return {
        ...state,
        tokens: {
          ...state.tokens,
          access: action.payload,
        },
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context
export interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
  clearError: () => void;
  updateUser: (payload: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for localStorage
const getStoredTokens = () => {
  if (typeof window === 'undefined') return { access: null, refresh: null };

  return {
    access: localStorage.getItem('access'),
    refresh: localStorage.getItem('refresh'),
  };
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userString = localStorage.getItem('user');
  if (!userString) return null;

  try {
    const parsed = JSON.parse(userString);
    // Normalize shape: some responses may nest the user under a `user` key
    if (
      parsed &&
      typeof parsed === 'object' &&
      'user' in parsed &&
      typeof parsed.user === 'object'
    ) {
      return parsed.user as User;
    }
    return parsed as User;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
};

const storeAuthData = (user: User, access: string, refresh: string) => {
  if (typeof window === 'undefined') return;

  // Ensure we store the normalized user object (avoid nesting)
  const toStore =
    user && typeof user === 'object' && 'user' in (user as any) ? (user as any).user : user;
  localStorage.setItem('user', JSON.stringify(toStore));
  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
};

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedTokens = getStoredTokens();
      const storedUser = getStoredUser();

      if (storedTokens.access && storedUser && isTokenValid(storedTokens.access)) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: storedUser,
            access: storedTokens.access,
            refresh: storedTokens.refresh || '',
          },
        });
      } else {
        // Clear invalid/expired data
        clearStoredAuth();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' });

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/jwt/login/`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username: email }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        const errorMessage = parseDjangoErrors(errorData);
        throw new Error(errorMessage);
      }

      const loginData = JSON.parse(responseText);

      // Normalize user in case backend nests it under `user`
      const savedUser =
        loginData && loginData.user && typeof loginData.user === 'object'
          ? loginData.user.user
            ? loginData.user.user
            : loginData.user
          : loginData.user || null;

      // Store in localStorage
      storeAuthData(savedUser as User, loginData.access, loginData.refresh);

      // Update state
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: savedUser,
          access: loginData.access,
          refresh: loginData.refresh,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearStoredAuth();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const refreshTokenValue = state.tokens.refresh;
    if (!refreshTokenValue) return null;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/jwt-refresh/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: refreshTokenValue,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          localStorage.setItem('access', data.access);
          dispatch({ type: 'TOKEN_REFRESH', payload: data.access });
          return data.access;
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }

    // If refresh fails, logout user
    clearStoredAuth();
    dispatch({ type: 'AUTH_LOGOUT' });
    return null;
  }, [state.tokens.refresh]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateUser = useCallback(
    async (payload: Partial<User>): Promise<User | null> => {
      const access = state.tokens.access;
      if (!access) return null;

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/`;
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const text = await response.text();
          let err;
          try {
            err = JSON.parse(text);
          } catch (e) {
            err = { message: text };
          }
          const message = parseDjangoErrors(err);
          dispatch({ type: 'AUTH_ERROR', payload: message });
          return null;
        }

        const updatedUserRaw = await response.json();
        // Normalize possible nested payloads: some backends return { user: {...} }
        const updatedUser =
          updatedUserRaw && typeof updatedUserRaw === 'object' && 'user' in updatedUserRaw
            ? (updatedUserRaw as any).user
            : updatedUserRaw;

        // Update localStorage and state with normalized user
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'AUTH_UPDATE_USER', payload: updatedUser });
        return updatedUser as User;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error updating user';
        dispatch({ type: 'AUTH_ERROR', payload: message });
        return null;
      }
    },
    [state.tokens.access]
  );

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    refreshToken,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Django error parser (moved from login page)
function parseDjangoErrors(errorData: any): string {
  const fieldErrors: string[] = [];

  if (errorData && typeof errorData === 'object') {
    // Check for email errors
    if (errorData.email && Array.isArray(errorData.email)) {
      fieldErrors.push(`Correo: ${errorData.email[0]}`);
    }

    // Check for password errors
    if (errorData.password && Array.isArray(errorData.password)) {
      fieldErrors.push(`Contraseña: ${errorData.password[0]}`);
    }

    // Check for non_field_errors (general errors like invalid credentials)
    if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
      const error = errorData.non_field_errors[0];
      if (error.includes('Unable to log in') || error.includes('Invalid credentials')) {
        fieldErrors.push('Correo electrónico o contraseña incorrectos.');
      } else {
        fieldErrors.push(error);
      }
    }

    // Check for detail message
    if (errorData.detail && typeof errorData.detail === 'string') {
      if (
        errorData.detail.includes('Invalid credentials') ||
        errorData.detail.includes('Unable to log in')
      ) {
        fieldErrors.push('Correo electrónico o contraseña incorrectos.');
      } else {
        fieldErrors.push(errorData.detail);
      }
    }

    // Check for message field
    if (errorData.message && typeof errorData.message === 'string') {
      fieldErrors.push(errorData.message);
    }
  }

  return fieldErrors.length > 0 ? fieldErrors[0] : 'Error al iniciar sesión';
}
