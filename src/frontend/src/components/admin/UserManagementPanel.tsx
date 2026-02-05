import { useState } from 'react';
import { useGetAllUsers, useUpdateUserStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { anonymizeUser } from '../../utils/privacy';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UserManagementPanel() {
  const { data: users, isLoading } = useGetAllUsers();
  const updateUserStatus = useUpdateUserStatus();

  const handleStatusChange = async (principal: string, status: string) => {
    try {
      await updateUserStatus.mutateAsync({
        user: { toText: () => principal } as any,
        status,
      });
      toast.success('User status updated successfully!');
    } catch (error) {
      console.error('Update user status error:', error);
      toast.error('Failed to update user status');
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {!users || users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users yet</p>
        ) : (
          <div className="space-y-3">
            {users.map(([principal, profile]) => (
              <div
                key={principal.toText()}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <h4 className="font-semibold">{profile.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {anonymizeUser(principal.toText())}
                  </p>
                  {profile.email && (
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={profile.status === 'active' ? 'default' : 'destructive'}>
                    {profile.status}
                  </Badge>
                  <Select
                    value={profile.status}
                    onValueChange={(status) => handleStatusChange(principal.toText(), status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
