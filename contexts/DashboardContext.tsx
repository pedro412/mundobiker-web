'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { Club, Chapter, Member, Event } from '@/types';

// Dashboard Overview Types
export interface DashboardOverview {
  my_clubs: Club[];
  my_chapters: Chapter[];
  my_memberships: Member[];
  upcoming_events: Event[];
  recent_activities: any[];
  stats: {
    total_clubs: number;
    total_chapters: number;
    total_events: number;
    total_members: number;
  };
}

export interface DashboardState {
  overview: DashboardOverview | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

// Action types
export type DashboardAction =
  | { type: 'DASHBOARD_LOADING' }
  | { type: 'DASHBOARD_SUCCESS'; payload: DashboardOverview }
  | { type: 'DASHBOARD_ERROR'; payload: string }
  | { type: 'DASHBOARD_CLEAR' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: DashboardState = {
  overview: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Reducer
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'DASHBOARD_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'DASHBOARD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        overview: action.payload,
        error: null,
        lastFetched: new Date(),
      };

    case 'DASHBOARD_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'DASHBOARD_CLEAR':
      return initialState;

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context interface
export interface DashboardContextType {
  state: DashboardState;
  dashboardOverview: DashboardOverview | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardOverview: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
  clearDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { state: authState } = useAuth();

  // Fetch dashboard overview
  const fetchDashboardOverview = useCallback(async (): Promise<void> => {
    if (!authState.isAuthenticated || !authState.tokens.access) {
      return;
    }

    dispatch({ type: 'DASHBOARD_LOADING' });

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/overview/`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.tokens.access}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error al cargar el dashboard';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const dashboardData = await response.json();
      dispatch({ type: 'DASHBOARD_SUCCESS', payload: dashboardData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el dashboard';
      dispatch({ type: 'DASHBOARD_ERROR', payload: errorMessage });
      console.error('Dashboard fetch error:', error);
    }
  }, [authState.isAuthenticated, authState.tokens.access]);

  // Auto-fetch dashboard when user logs in
  useEffect(() => {
    if (
      authState.isAuthenticated &&
      authState.tokens.access &&
      !state.overview &&
      !state.isLoading
    ) {
      fetchDashboardOverview();
    }
  }, [
    authState.isAuthenticated,
    authState.tokens.access,
    state.overview,
    state.isLoading,
    fetchDashboardOverview,
  ]);

  // Clear dashboard when user logs out
  useEffect(() => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'DASHBOARD_CLEAR' });
    }
  }, [authState.isAuthenticated]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async (): Promise<void> => {
    await fetchDashboardOverview();
  }, [fetchDashboardOverview]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Clear dashboard function
  const clearDashboard = useCallback(() => {
    dispatch({ type: 'DASHBOARD_CLEAR' });
  }, []);

  const contextValue: DashboardContextType = {
    state,
    dashboardOverview: state.overview,
    isLoading: state.isLoading,
    error: state.error,
    fetchDashboardOverview,
    refreshDashboard,
    clearError,
    clearDashboard,
  };

  return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
}

// Custom hook to use dashboard context
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Convenience hooks for specific data
export function useDashboardOverview() {
  const { dashboardOverview } = useDashboard();
  return dashboardOverview;
}

export function useUserClubs() {
  const { dashboardOverview } = useDashboard();
  return dashboardOverview?.my_clubs || [];
}

export function useUserChapters() {
  const { dashboardOverview } = useDashboard();
  return dashboardOverview?.my_chapters || [];
}

export function useUserMemberships() {
  const { dashboardOverview } = useDashboard();
  return dashboardOverview?.my_memberships || [];
}

export function useUpcomingEvents() {
  const { dashboardOverview } = useDashboard();
  return dashboardOverview?.upcoming_events || [];
}

export function useDashboardStats() {
  const { dashboardOverview } = useDashboard();
  return (
    dashboardOverview?.stats || {
      total_clubs: 0,
      total_chapters: 0,
      total_events: 0,
      total_members: 0,
    }
  );
}

// Utility hooks for membership checks
export function useIsMemberOfClub() {
  const userClubs = useUserClubs();

  return (clubId: number | string): boolean => {
    const id = typeof clubId === 'string' ? parseInt(clubId) : clubId;
    return userClubs.some((club) => club.id === id);
  };
}

export function useIsMemberOfChapter() {
  const userChapters = useUserChapters();

  return (chapterId: number | string): boolean => {
    const id = typeof chapterId === 'string' ? parseInt(chapterId) : chapterId;
    return userChapters.some((chapter) => chapter.id === id);
  };
}

export function useUserRoleInChapter() {
  const userMemberships = useUserMemberships();

  return (chapterId: number | string): string | null => {
    const id = typeof chapterId === 'string' ? parseInt(chapterId) : chapterId;
    const membership = userMemberships.find((membership) => membership.chapter === id);
    return membership?.role || null;
  };
}
