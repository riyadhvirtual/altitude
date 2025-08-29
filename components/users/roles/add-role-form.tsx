'use client';

import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { addRoleAction } from '@/actions/users/add-role';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/lib/auth-client';

const AVAILABLE_ROLES = [
  'pireps',
  'fleet',
  'routes',
  'events',
  'users',
  'multipliers',
  'ranks',
] as const;

type Role = (typeof AVAILABLE_ROLES)[number];

interface AddRoleFormProps {
  userId: string;
  currentRoles: string[];
}

export function AddRoleForm({ userId, currentRoles }: AddRoleFormProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useSession();

  const remainingRoles = AVAILABLE_ROLES.filter(
    (r) => !currentRoles.includes(r)
  );

  const { execute } = useAction(addRoleAction, {
    onSuccess: async ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        setSelectedRole('');
        // Refresh the session to get updated roles
        await refetch();
        router.refresh();
      }
      setIsLoading(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to add role');
      setIsLoading(false);
    },
  });

  const handleAddRole = () => {
    if (!selectedRole) {
      return;
    }
    setIsLoading(true);
    execute({ userId, role: selectedRole });
  };

  if (remainingRoles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedRole}
        onValueChange={(val) => setSelectedRole(val as Role)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {remainingRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={!selectedRole || isLoading}
        onClick={handleAddRole}
      >
        {isLoading ? 'Adding...' : 'Add'}
      </Button>
    </div>
  );
}
