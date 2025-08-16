import { Badge } from '@/components/ui/badge';

export interface RoleMapping {
  spanish: string;
  priority: number;
}

// Role mappings with Spanish translations and priority order
export const ROLE_MAPPINGS: Record<string, RoleMapping> = {
  // National roles (highest priority)
  national_president: { spanish: 'Presidente Nacional', priority: 1 },
  national_vice_president: { spanish: 'Vice Presidente Nacional', priority: 2 },
  national_secretary: { spanish: 'Secretario Nacional', priority: 3 },
  national_counselor: { spanish: 'Consejero Nacional', priority: 4 },

  // Zone roles
  zone_vp_south: { spanish: 'Vice Presidente Zona Sur', priority: 5 },
  zone_vp_center: { spanish: 'Vice Presidente Zona Centro', priority: 6 },
  zone_vp_north: { spanish: 'Vice Presidente Zona Norte', priority: 7 },

  // Local chapter roles
  president: { spanish: 'Presidente', priority: 10 },
  vice_president: { spanish: 'Vice Presidente', priority: 11 },
  secretary: { spanish: 'Secretario', priority: 12 },
  treasurer: { spanish: 'Tesorero', priority: 13 },
  road_captain: { spanish: 'Capitán de Ruta', priority: 14 },
  sergeant_at_arms: { spanish: 'Sargento de Armas', priority: 15 },

  // Regular member (lowest priority)
  member: { spanish: 'Miembro', priority: 99 },

  // Empty/null role handling
  '': { spanish: 'Sin rol asignado', priority: 100 },
};

interface RoleBadgeProps {
  role: string;
  chapterName?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function RoleBadge({ role, chapterName, variant = 'outline', className }: RoleBadgeProps) {
  const roleMapping = ROLE_MAPPINGS[role.toLowerCase()];
  let displayText = roleMapping?.spanish || role;

  // For local chapter roles, append chapter name if provided
  if (chapterName && roleMapping && roleMapping.priority >= 10 && roleMapping.priority <= 15) {
    displayText = `${displayText} de ${chapterName}`;
  }

  // Apply different styling based on role priority
  const getRoleVariant = () => {
    if (!roleMapping) return variant;

    switch (true) {
      case roleMapping.priority <= 4: // National roles
        return 'default';
      case roleMapping.priority <= 7: // Zone roles
        return 'secondary';
      case roleMapping.priority <= 15: // Local chapter roles
        return 'outline';
      default: // Member and unassigned
        return variant;
    }
  };

  return (
    <Badge variant={getRoleVariant()} className={className}>
      {displayText}
    </Badge>
  );
}

// Utility function to sort members by role priority
export function sortMembersByRole<T extends { role?: string; national_role?: string }>(
  members: T[]
): T[] {
  return members.sort((a, b) => {
    const roleA = a.role || a.national_role || 'member';
    const roleB = b.role || b.national_role || 'member';

    const priorityA = ROLE_MAPPINGS[roleA.toLowerCase()]?.priority || 99;
    const priorityB = ROLE_MAPPINGS[roleB.toLowerCase()]?.priority || 99;

    return priorityA - priorityB;
  });
}
