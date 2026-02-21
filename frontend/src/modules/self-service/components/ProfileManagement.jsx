import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar, Save, Key, XCircle, CreditCard, Camera, Upload, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label
} from '@/components/ui';
import { selfServiceService } from '@/services/selfServiceService';
import { toast } from 'react-hot-toast';

const ProfileManagement = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef(null);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await selfServiceService.getProfile();
      
      if (response.data.success) {
        const userData = response.data.data.user;
        console.log('Profile data received:', userData);
        setProfile(userData);
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          emergency_contact_name: userData.Employee?.emergency_contact_name || '',
          emergency_contact_phone: userData.Employee?.emergency_contact_phone || '',
          emergency_contact_relationship: userData.Employee?.emergency_contact_relationship || '',
          address: userData.Employee?.address || '',
          city: userData.Employee?.city || '',
          state: userData.Employee?.state || '',
          postal_code: userData.Employee?.postal_code || '',
          country: userData.Employee?.country || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await selfServiceService.updateProfile(formData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        fetchProfile();
      } else {
        toast(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast('New passwords do not match');
      return;
    }
    
    try {
      const response = await selfServiceService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        setShowPasswordModal(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        toast(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await selfServiceService.uploadProfilePicture(formData);

      if (response.data.success) {
        toast.success('Profile picture updated successfully');
        // Refresh profile data to get new avatar URL
        fetchProfile();
      } else {
        toast.error(response.data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile Management</h1>
          <p className="text-muted-foreground">Update your personal information and account settings</p>
        </div>
        {/* <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
          <Key className="h-4 w-4 mr-2" />
          Change Password
        </Button> */}
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload and manage your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                {profile?.cloudinary_avatar_url || profile?.avatar ? (
                  <img
                    src={profile.cloudinary_avatar_url || profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={uploadingAvatar}
                  className="flex items-center space-x-2"
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span>Change Picture</span>
                    </>
                  )}
                </Button>
                {(profile?.cloudinary_avatar_url || profile?.avatar) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    disabled={uploadingAvatar}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload a new profile picture. JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your basic personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Employee ID - Read Only */}
              <div>
                <Label htmlFor="employee_id">Employee ID</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    name="employee_id"
                    id="employee_id"
                    value={profile?.Employee?.employee_id || 'N/A'}
                    className="pl-10 bg-gray-50"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="first_name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Emergency Contact Information</CardTitle>
                <CardDescription>Contact person in case of emergency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="emergency_contact_name">Contact Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        name="emergency_contact_name"
                        id="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Full name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact_phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="tel"
                        name="emergency_contact_phone"
                        id="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                    <Input
                      type="text"
                      name="emergency_contact_relationship"
                      id="emergency_contact_relationship"
                      value={formData.emergency_contact_relationship}
                      onChange={handleInputChange}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Address Information</CardTitle>
                <CardDescription>Your current residential address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Street address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        type="text"
                        name="state"
                        id="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State or Province"
                      />
                    </div>

                    <div>
                      <Label htmlFor="postal_code">ZIP/Postal Code</Label>
                      <Input
                        type="text"
                        name="postal_code"
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        placeholder="Postal code"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        name="country"
                        id="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="password"
                    name="current_password"
                    id="current_password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="password"
                    name="new_password"
                    id="new_password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Choose any password you prefer
                </p>
              </div>

              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="password"
                    name="confirm_password"
                    id="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
                </div>

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Change Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileManagement;