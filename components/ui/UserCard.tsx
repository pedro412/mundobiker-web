import { Card, CardContent } from '@/components/ui/card';
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
    <Card className={`hover:shadow-lg transition-all duration-200 ${className || ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Profile Picture - Large and Centered */}
          <div className="relative">
            {user.profile_picture ? (
              <OptimizedImage
                src={user.profile_picture}
                alt={`${user.first_name} ${user.last_name}`}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {user.first_name.charAt(0)}
                  {user.last_name.charAt(0)}
                </span>
              </div>
            )}
            {/* Active Status Indicator */}
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
                user.is_active ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <span className="sr-only">{user.is_active ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>

          {/* Name and Nickname */}
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 text-lg">
              {user.first_name} {user.last_name}
            </h3>
            {user.nickname && (
              <p className="text-sm text-gray-600 font-medium">&quot;{user.nickname}&quot;</p>
            )}
          </div>

          {/* Role Badges */}
          <div className="flex flex-col items-center gap-2">
            {hasNationalRole && (
              <RoleBadge role={user.national_role!} className="text-xs font-medium" />
            )}
            {hasLocalRole && (
              <RoleBadge
                role={user.role!}
                chapterName={chapter?.name}
                className="text-xs font-medium"
              />
            )}
            {!hasNationalRole && !hasLocalRole && (
              <RoleBadge
                role="member"
                chapterName={chapter?.name}
                className="text-xs font-medium"
              />
            )}
          </div>

          {/* Optional Date Information */}
          {(showBirthDate || showJoinDate) && (
            <div className="pt-2 border-t border-gray-100 w-full space-y-2">
              {showBirthDate && user.date_of_birth && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>🎂</span>
                  <span>{new Date(user.date_of_birth).toLocaleDateString('es-MX')}</span>
                </div>
              )}
              {showJoinDate && user.joined_at && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>📅</span>
                  <span>Se unió {new Date(user.joined_at).toLocaleDateString('es-MX')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
