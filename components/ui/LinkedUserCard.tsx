import { Card, CardContent } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Member } from '@/types';

interface LinkedUserCardProps {
  primaryUser: Member;
  linkedUser?: Member;
  chapter?: {
    id: string | number;
    name: string;
  };
  showBirthDate?: boolean;
  showJoinDate?: boolean;
  className?: string;
}

export function LinkedUserCard({
  primaryUser,
  linkedUser,
  chapter,
  showBirthDate = false,
  showJoinDate = false,
  className,
}: LinkedUserCardProps) {
  const renderUserSection = (user: Member, isLinked = false) => {
    const hasNationalRole = user.national_role && user.national_role.trim() !== '';
    const hasLocalRole = user.role && user.role.trim() !== '';
    const isVested = user.metadata?.is_vested;

    return (
      <div
        className={`flex flex-col items-center text-center space-y-3 ${isLinked ? 'opacity-90' : ''}`}
      >
        {/* Profile Picture */}
        <div className="relative">
          {user.profile_picture ? (
            <OptimizedImage
              src={user.profile_picture}
              alt={`${user.first_name} ${user.last_name}`}
              width={isLinked ? 60 : 80}
              height={isLinked ? 60 : 80}
              className={`${isLinked ? 'w-16 h-16' : 'w-20 h-20'} rounded-full object-cover border-4 border-white shadow-lg`}
            />
          ) : (
            <div
              className={`${isLinked ? 'w-16 h-16' : 'w-20 h-20'} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg`}
            >
              <span className={`text-white font-bold ${isLinked ? 'text-lg' : 'text-2xl'}`}>
                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}
              </span>
            </div>
          )}
          {/* Active Status Indicator */}
          <div
            className={`absolute -bottom-1 -right-1 ${isLinked ? 'w-4 h-4' : 'w-6 h-6'} rounded-full border-2 border-white ${
              user.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`}
          >
            <span className="sr-only">{user.is_active ? 'Activo' : 'Inactivo'}</span>
          </div>
          {/* Vested Indicator */}
          {isVested && (
            <div
              className={`absolute -top-1 -left-1 ${isLinked ? 'w-4 h-4' : 'w-6 h-6'} rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center`}
            >
              <span className={`text-white ${isLinked ? 'text-xs' : 'text-sm'}`}>⭐</span>
            </div>
          )}
        </div>

        {/* Name and Nickname */}
        <div className="space-y-1">
          <h3 className={`font-bold text-gray-900 ${isLinked ? 'text-base' : 'text-lg'}`}>
            {user.first_name} {user.last_name}
          </h3>
          {user.nickname && (
            <p className={`text-gray-600 font-medium ${isLinked ? 'text-xs' : 'text-sm'}`}>
              &quot;{user.nickname}&quot;
            </p>
          )}
        </div>

        {/* Role Badges */}
        <div className="flex flex-col items-center gap-1">
          {hasNationalRole && (
            <RoleBadge
              role={user.national_role!}
              className={`font-medium ${isLinked ? 'text-xs' : 'text-xs'}`}
            />
          )}
          {hasLocalRole && (
            <RoleBadge
              role={user.role!}
              chapterName={chapter?.name}
              className={`font-medium ${isLinked ? 'text-xs' : 'text-xs'}`}
            />
          )}
          {!hasNationalRole && !hasLocalRole && (
            <RoleBadge
              role="member"
              chapterName={chapter?.name}
              className={`font-medium ${isLinked ? 'text-xs' : 'text-xs'}`}
            />
          )}
        </div>

        {/* Optional Date Information */}
        {(showBirthDate || showJoinDate) && (
          <div className="pt-2 border-t border-gray-100 w-full space-y-1">
            {showBirthDate && user.date_of_birth && (
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <span>🎂</span>
                <span>{new Date(user.date_of_birth).toLocaleDateString('es-MX')}</span>
              </div>
            )}
            {showJoinDate && user.joined_at && (
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <span>📅</span>
                <span>Se unió {new Date(user.joined_at).toLocaleDateString('es-MX')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${className || ''}`}>
      <CardContent className="p-6">
        {linkedUser ? (
          <div className="space-y-6">
            {/* Primary User */}
            {renderUserSection(primaryUser)}

            {/* Connection Indicator */}
            <div className="flex items-center justify-center">
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="mx-2 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
            </div>

            {/* Linked User */}
            {renderUserSection(linkedUser, true)}
          </div>
        ) : (
          renderUserSection(primaryUser)
        )}
      </CardContent>
    </Card>
  );
}
