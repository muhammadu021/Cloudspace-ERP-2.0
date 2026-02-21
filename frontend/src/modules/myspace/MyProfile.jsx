import React, { useState } from 'react';
import { Card, Button, FormField, Badge, Tabs } from '../../design-system/components';
import { 
  useGetMyProfileQuery, 
  useUpdateMyProfileMutation,
  useGetMyAttendanceQuery,
  useGetMyLeaveBalanceQuery 
} from '../../store/api/mySpaceApi';

const MyProfile = () => {
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const [updateProfile] = useUpdateMyProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const handleEdit = () => {
    setFormData(profile || {});
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (isLoading) return <div>Loading...</div>;

  const tabs = [
    {
      id: 'info',
      label: 'Personal Info',
      content: <PersonalInfoTab profile={profile} isEditing={isEditing} formData={formData} setFormData={setFormData} />
    },
    {
      id: 'attendance',
      label: 'Attendance',
      content: <AttendanceTab />
    },
    {
      id: 'leave',
      label: 'Leave Balance',
      content: <LeaveBalanceTab />
    },
    {
      id: 'settings',
      label: 'Settings',
      content: <SettingsTab profile={profile} />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </div>

      <Tabs tabs={tabs} defaultTab="info" />
    </div>
  );
};

const PersonalInfoTab = ({ profile, isEditing, formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              type="text"
              label="First Name"
              value={isEditing ? formData.firstName : profile?.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing}
            />
            <FormField
              type="text"
              label="Last Name"
              value={isEditing ? formData.lastName : profile?.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing}
            />
            <FormField
              type="email"
              label="Email"
              value={isEditing ? formData.email : profile?.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
            />
            <FormField
              type="tel"
              label="Phone"
              value={isEditing ? formData.phone : profile?.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
            />
            <FormField
              type="date"
              label="Date of Birth"
              value={isEditing ? formData.dateOfBirth : profile?.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              disabled={!isEditing}
            />
            <FormField
              type="text"
              label="Employee ID"
              value={profile?.employeeId}
              disabled
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <div className="text-gray-900">{profile?.department}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <div className="text-gray-900">{profile?.position}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <div className="text-gray-900">{profile?.manager}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <div className="text-gray-900">
                {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <Badge variant="default">{profile?.employmentType}</Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Badge variant={profile?.status === 'active' ? 'success' : 'neutral'}>
                {profile?.status}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="space-y-4">
            <FormField
              type="text"
              label="Street Address"
              value={isEditing ? formData.address?.street : profile?.address?.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              disabled={!isEditing}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                type="text"
                label="City"
                value={isEditing ? formData.address?.city : profile?.address?.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
                disabled={!isEditing}
              />
              <FormField
                type="text"
                label="State"
                value={isEditing ? formData.address?.state : profile?.address?.state}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, state: e.target.value }
                })}
                disabled={!isEditing}
              />
              <FormField
                type="text"
                label="ZIP Code"
                value={isEditing ? formData.address?.zip : profile?.address?.zip}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, zip: e.target.value }
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              type="text"
              label="Contact Name"
              value={isEditing ? formData.emergencyContact?.name : profile?.emergencyContact?.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                emergencyContact: { ...formData.emergencyContact, name: e.target.value }
              })}
              disabled={!isEditing}
            />
            <FormField
              type="text"
              label="Relationship"
              value={isEditing ? formData.emergencyContact?.relationship : profile?.emergencyContact?.relationship}
              onChange={(e) => setFormData({ 
                ...formData, 
                emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
              })}
              disabled={!isEditing}
            />
            <FormField
              type="tel"
              label="Phone"
              value={isEditing ? formData.emergencyContact?.phone : profile?.emergencyContact?.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
              })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

const AttendanceTab = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  const { data: attendance = [], isLoading } = useGetMyAttendanceQuery(dateRange);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
            <div className="flex gap-2">
              <FormField
                type="date"
                label="From"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
              <FormField
                type="date"
                label="To"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} 
                      {' → '}
                      {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{record.hoursWorked || 0} hrs</div>
                    <Badge variant={
                      record.status === 'present' ? 'success' :
                      record.status === 'late' ? 'warning' :
                      record.status === 'absent' ? 'error' : 'default'
                    }>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Days</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {attendance.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Present</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {attendance.filter(r => r.status === 'present').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Late</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {attendance.filter(r => r.status === 'late').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Absent</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {attendance.filter(r => r.status === 'absent').length}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const LeaveBalanceTab = () => {
  const { data: leaveBalance, isLoading } = useGetMyLeaveBalanceQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
          <div className="space-y-4">
            {leaveBalance?.types?.map((type) => (
              <div key={type.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{type.name}</div>
                  <div className="text-sm text-gray-600">
                    {type.used} used • {type.pending} pending
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{type.available}</div>
                  <div className="text-sm text-gray-600">days available</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave History</h3>
          <div className="space-y-2">
            {leaveBalance?.history?.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{leave.type}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{leave.days} days</div>
                  <Badge variant={
                    leave.status === 'approved' ? 'success' :
                    leave.status === 'pending' ? 'warning' :
                    leave.status === 'rejected' ? 'error' : 'default'
                  }>
                    {leave.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const SettingsTab = ({ profile }) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-600">Receive updates via email</div>
              </div>
              <FormField type="checkbox" checked={profile?.notifications?.email} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Leave Approvals</div>
                <div className="text-sm text-gray-600">Notify when leave is approved/rejected</div>
              </div>
              <FormField type="checkbox" checked={profile?.notifications?.leaveApprovals} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Expense Updates</div>
                <div className="text-sm text-gray-600">Notify about expense claim status</div>
              </div>
              <FormField type="checkbox" checked={profile?.notifications?.expenses} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          <div className="space-y-3">
            <Button variant="outline" fullWidth>Change Password</Button>
            <Button variant="outline" fullWidth>Enable Two-Factor Authentication</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyProfile;
