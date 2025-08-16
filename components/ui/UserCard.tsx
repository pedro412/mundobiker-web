import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface UserCardProps {
  user: {
    id: string | number;
    first_name: string;
    last_name: string;
    nickname?: string;
    role?: string;
    national_role?: string;
    is_active?: boolean;
    profile_picture?: string;
    date_of_birth?: string;
    joined_at?: string;
    chapter_id?: string | number;
  };
  chapter?: {
    id: string | number;
    name: string;
  };
  showBirthDate?: boolean;
  showJoinDate?: boolean;
  className?: string;
}

export function UserCard({
  user,
  chapter,
  showBirthDate = false,
  showJoinDate = false,
  className,
}: UserCardProps) {
  const hasNationalRole = user.national_role && user.national_role.trim() !== '';
  const hasLocalRole = user.role && user.role.trim() !== '';

  return (
    <Card className={`hover:shadow-md transition-shadow ${className || ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with profile picture and name */}
          <div className="flex items-start gap-3">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {user.profile_picture ? (
                <OptimizedImage
                  src={user.profile_picture}
                  alt={`${user.first_name} ${user.last_name}`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-gray-600 font-semibold text-lg">
                    {user.first_name.charAt(0)}
                    {user.last_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Name Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg">
                {user.first_name} {user.last_name}
              </h3>
              {user.nickname && (
                <p className="text-sm text-gray-600">&quot;{user.nickname}&quot;</p>
              )}
            </div>
          </div>

          {/* Role Badges Section */}
          <div className="flex flex-wrap gap-1">
            {hasNationalRole && <RoleBadge role={user.national_role!} className="text-xs" />}
            {hasLocalRole && (
              <RoleBadge role={user.role!} chapterName={chapter?.name} className="text-xs" />
            )}
            {!hasNationalRole && !hasLocalRole && (
              <RoleBadge role="member" chapterName={chapter?.name} className="text-xs" />
            )}
          </div>

          {/* Status and Additional Info */}
          <div className="space-y-2">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Estado:</span>
              <Badge variant={user.is_active ? 'default' : 'outline'} className="text-xs">
                {user.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {/* Optional Date Information */}
            {(showBirthDate || showJoinDate) && (
              <div className="space-y-1 text-xs text-gray-500">
                {showBirthDate && user.date_of_birth && (
                  <p>🎂 Nacido: {new Date(user.date_of_birth).toLocaleDateString('es-MX')}</p>
                )}
                {showJoinDate && user.joined_at && (
                  <p>📅 Se unió: {new Date(user.joined_at).toLocaleDateString('es-MX')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
