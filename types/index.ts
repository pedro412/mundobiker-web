export interface Club {
  id: number;
  name: string;
  description?: string;
  foundation_date: string;
  logo?: string | null;
  website?: string;
  created_at: string;
  updated_at: string;
  total_members: number;
}

export interface Chapter {
  id: number;
  name: string;
  description?: string;
  foundation_date: string;
  club: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  total_members: number;
}

export interface Member {
  id: number;
  chapter: number;
  first_name: string;
  last_name: string;
  nickname?: string;
  date_of_birth?: string;
  role: string;
  member_type: string;
  national_role?: string;
  profile_picture?: string;
  joined_at?: string;
  user?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: {
    is_vested?: boolean;
    linked_to?: number;
  };
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  clubId?: string;
  createdAt?: string;
  updatedAt?: string;
}
