import React from 'react';
import { Card, Button, Badge } from '../../design-system/components';
import { useGetRolesQuery } from '../../store/api/adminApi';

export const Roles = () => {
  const { data: roles = [], isLoading } = useGetRolesQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure roles and permissions
          </p>
        </div>
        <Button>Create Role</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                </div>
                <Badge variant="info">{role.userCount} users</Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm font-medium text-gray-700">Permissions:</div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 5).map((permission, idx) => (
                    <Badge key={idx} variant="default" size="sm">
                      {permission}
                    </Badge>
                  ))}
                  {role.permissions?.length > 5 && (
                    <Badge variant="default" size="sm">
                      +{role.permissions.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Users
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
