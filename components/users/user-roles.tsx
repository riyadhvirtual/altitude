import { AddRoleDropdown } from '@/components/users/roles/add-role-dropdown';
import { RemoveRoleButton } from '@/components/users/roles/remove-role-button';

interface UserRolesProps {
  user: {
    id: string;
    name: string | null;
    role: unknown;
  };
  canManageRoles: boolean;
  isCurrentUserOwner?: boolean;
}

function parseRoles(role: unknown): string[] {
  if (!role) {
    return [];
  }
  if (Array.isArray(role)) {
    return role as string[];
  }
  if (typeof role === 'string') {
    if (role.startsWith('[') && role.endsWith(']')) {
      try {
        return role
          .slice(1, -1)
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);
      } catch {
        return [];
      }
    }
    return [role];
  }
  return [];
}

export function UserRoles({
  user,
  canManageRoles,
  isCurrentUserOwner = false,
}: UserRolesProps) {
  const roles = parseRoles(user.role);
  const nonAdminRoles = roles.filter(
    (r) => r !== 'admin' && r !== 'owner' && r !== 'user'
  );
  const isAdmin = roles.includes('admin');
  const isOwner = roles.includes('owner');

  return (
    <div className="rounded-lg border border-input bg-panel p-6">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Roles & Permissions
          </p>
          <h3 className="text-xl font-semibold text-foreground">
            Manage User Access
          </h3>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Admin badge, removable only by owner */}
          {isAdmin && (
            <div className="group relative">
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground border border-input text-sm font-medium">
                Admin
                {canManageRoles && isCurrentUserOwner && (
                  <div className="ml-3">
                    <RemoveRoleButton
                      userId={user.id}
                      role="admin"
                      userName={user.name || undefined}
                      className="text-primary-foreground hover:text-primary-foreground/80 focus-visible:outline-none focus-visible:ring-0"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other removable roles */}
          {nonAdminRoles.map((role) => (
            <div key={role} className="group relative">
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-panel text-panel-foreground border border-input hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium">
                <span className="capitalize">{role.replace('_', ' ')}</span>
                {canManageRoles && (
                  <div className="ml-3">
                    <RemoveRoleButton
                      userId={user.id}
                      role={role}
                      userName={user.name || undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add role if allowed */}
          {canManageRoles && (
            <AddRoleDropdown userId={user.id} currentRoles={roles} />
          )}

          {/* Empty state when no roles to show */}
          {!isAdmin && nonAdminRoles.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center gap-3">
              {isOwner ? (
                <>
                  <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground border border-input text-sm font-medium">
                    Owner
                  </div>
                  <span>
                    Owner role grants all privileges and access to every
                    feature.
                  </span>
                </>
              ) : (
                <>
                  <span>No additional roles assigned</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
