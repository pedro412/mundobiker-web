import { Card, CardContent } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Member } from '@/types';

interface LinkedUserCardProps {
  primaryUser: Member;
  linkedUser?: Member;
  linkedUsers?: Member[];
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
  linkedUsers = [],
  chapter,
  showBirthDate = false,
  showJoinDate = false,
  className,
}: LinkedUserCardProps) {
  // Support both single linkedUser (backward compatibility) and multiple linkedUsers
  const allLinkedUsers = linkedUser ? [linkedUser, ...linkedUsers] : linkedUsers;
  const renderUserSection = (user: Member, isLinked = false, isCompact = false) => {
    const hasNationalRole = user.national_role && user.national_role.trim() !== '';
    const hasLocalRole = user.role && user.role.trim() !== '';
    const isVested = user.metadata?.is_vested;

    // Use smaller sizes when compact (for multiple linked users)
    const avatarSize = isCompact ? 'w-12 h-12' : isLinked ? 'w-16 h-16' : 'w-20 h-20';
    const avatarTextSize = isCompact ? 'text-sm' : isLinked ? 'text-lg' : 'text-2xl';
    const nameSize = isCompact ? 'text-sm' : isLinked ? 'text-base' : 'text-lg';
    const nicknameSize = isCompact ? 'text-xs' : isLinked ? 'text-xs' : 'text-sm';

    return (
      <div
        className={`flex flex-col items-center text-center ${isCompact ? 'space-y-2' : 'space-y-3'} ${isLinked ? 'opacity-90' : ''}`}
      >
        {/* Profile Picture */}
        <div className="relative">
          {user.profile_picture ? (
            <OptimizedImage
              src={user.profile_picture}
              alt={`${user.first_name} ${user.last_name}`}
              width={isCompact ? 48 : isLinked ? 60 : 80}
              height={isCompact ? 48 : isLinked ? 60 : 80}
              className={`${avatarSize} rounded-full object-cover border-4 border-white shadow-lg`}
            />
          ) : (
            <div
              className={`${avatarSize} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg`}
            >
              <span className={`text-white font-bold ${avatarTextSize}`}>
                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}
              </span>
            </div>
          )}
          {/* Active Status Indicator */}
          <div
            className={`absolute -bottom-1 -right-1 ${isCompact ? 'w-3 h-3' : isLinked ? 'w-4 h-4' : 'w-6 h-6'} rounded-full border-2 border-white ${
              user.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`}
          >
            <span className="sr-only">{user.is_active ? 'Activo' : 'Inactivo'}</span>
          </div>
          {/* Vested Indicator */}
          {isVested && (
            <div
              className={`absolute -top-1 -left-1 ${isCompact ? 'w-3 h-3' : isLinked ? 'w-4 h-4' : 'w-6 h-6'} rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center`}
            >
              <span
                className={`text-white ${isCompact ? 'text-xs' : isLinked ? 'text-xs' : 'text-sm'}`}
              >
                ⭐
              </span>
            </div>
          )}
        </div>

        {/* Name and Nickname */}
        <div className={isCompact ? 'space-y-0' : 'space-y-1'}>
          <h3 className={`font-bold text-gray-900 ${nameSize}`}>
            {user.first_name} {user.last_name}
          </h3>
          {user.nickname && (
            <p className={`text-gray-600 font-medium ${nicknameSize}`}>
              &quot;{user.nickname}&quot;
            </p>
          )}
        </div>

        {/* Role Badges */}
        {!isCompact && (
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
        )}

        {/* Optional Date Information */}
        {!isCompact && (showBirthDate || showJoinDate) && (
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
        {allLinkedUsers.length > 0 ? (
          <div className="space-y-4">
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

            {/* Linked Users */}
            <div className="space-y-3">
              {allLinkedUsers.length === 1 ? (
                // Single linked user - use existing layout
                renderUserSection(allLinkedUsers[0], true)
              ) : allLinkedUsers.length <= 4 ? (
                // 2-4 linked users - use compact grid layout
                <div
                  className={`grid gap-3 ${allLinkedUsers.length === 2 ? 'grid-cols-2' : allLinkedUsers.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
                >
                  {allLinkedUsers.map((user) => (
                    <div key={user.id} className="bg-gray-50 rounded-lg p-3">
                      {renderUserSection(user, true, true)}
                    </div>
                  ))}
                </div>
              ) : (
                // More than 4 linked users - show first 3 and count
                <div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {allLinkedUsers.slice(0, 3).map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg p-3">
                        {renderUserSection(user, true, true)}
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                      +{allLinkedUsers.length - 3} miembros más
                    </span>
                  </div>
                </div>
              )}

              {/* Show count if more than 1 linked user */}
              {allLinkedUsers.length > 1 && allLinkedUsers.length <= 4 && (
                <div className="text-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {allLinkedUsers.length} miembros vinculados
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          renderUserSection(primaryUser)
        )}
      </CardContent>
    </Card>
  );
}
