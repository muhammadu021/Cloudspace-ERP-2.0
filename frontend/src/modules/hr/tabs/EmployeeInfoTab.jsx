import React from 'react';
import { InlineEditField } from '../../../design-system/components';
import { useUpdateEmployeeMutation } from '../../../store/api/hrApi';

export const EmployeeInfoTab = ({ employee }) => {
  const [updateEmployee] = useUpdateEmployeeMutation();

  const handleUpdate = async (field, value) => {
    await updateEmployee({ id: employee.id, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <InlineEditField
              value={employee.name}
              onSave={(value) => handleUpdate('name', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <div className="text-sm text-gray-900">{employee.employeeId}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <InlineEditField
              value={employee.email}
              type="email"
              onSave={(value) => handleUpdate('email', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <InlineEditField
              value={employee.phone}
              onSave={(value) => handleUpdate('phone', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <InlineEditField
              value={employee.dateOfBirth}
              type="date"
              onSave={(value) => handleUpdate('dateOfBirth', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <InlineEditField
              value={employee.gender}
              onSave={(value) => handleUpdate('gender', value)}
            />
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <InlineEditField
              value={employee.department}
              onSave={(value) => handleUpdate('department', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <InlineEditField
              value={employee.position}
              onSave={(value) => handleUpdate('position', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Join Date
            </label>
            <InlineEditField
              value={employee.joinDate}
              type="date"
              onSave={(value) => handleUpdate('joinDate', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <InlineEditField
              value={employee.employmentType}
              onSave={(value) => handleUpdate('employmentType', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager
            </label>
            <InlineEditField
              value={employee.manager}
              onSave={(value) => handleUpdate('manager', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <InlineEditField
              value={employee.status}
              onSave={(value) => handleUpdate('status', value)}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <InlineEditField
              value={employee.address}
              onSave={(value) => handleUpdate('address', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <InlineEditField
              value={employee.city}
              onSave={(value) => handleUpdate('city', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <InlineEditField
              value={employee.state}
              onSave={(value) => handleUpdate('state', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <InlineEditField
              value={employee.postalCode}
              onSave={(value) => handleUpdate('postalCode', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <InlineEditField
              value={employee.country}
              onSave={(value) => handleUpdate('country', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
