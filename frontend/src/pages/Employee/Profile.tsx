import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById } from '@/utils/User';
import { Employee } from '@/utils/Employee';
import { toast } from 'sonner'

const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);

  const fetchProfile = async () => {
    try {
      const profileData = await getUserById(user._id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchProfile();
  }, [])

  if (!profile) {
    return <div className="flex justify-center items-center h-96">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View your personal information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage as string}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <CardTitle className="text-xl">{profile.employeeId} - {profile.name}</CardTitle>
              <CardDescription>{profile.designation}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{profile.contactNo}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{profile.department?.departmentName}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Joined {formatDate(profile.doj)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    value={formatDate(profile.dob)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={profile.gender}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Input
                    id="maritalStatus"
                    value={profile.maritalStatus}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={profile.nationality || 'N/A'}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="korusEmail">Korus Email</Label>
                  <Input
                    id="korusEmail"
                    value={profile.korusEmail || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNo">Contact No.</Label>
                  <Input
                    id="contactNo"
                    value={profile.contactNo}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altContactNo">Alternate Contact No.</Label>
                  <Input
                    id="altContactNo"
                    value={profile.altContactNo || 'N/A'}
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permanentAddress">Permanent Address</Label>
                <Textarea
                  id="permanentAddress"
                  value={profile.permanentAddress || 'N/A'}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localAddress">Local Address</Label>
                <Textarea
                  id="localAddress"
                  value={profile.localAddress || 'N/A'}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Your job-related details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={profile.employeeId}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={profile.designation}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department?.departmentName}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hod">HOD</Label>
                  <Input
                    id="hod"
                    value={profile.hod || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={profile.qualification}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yop">Year of Passing</Label>
                  <Input
                    id="yop"
                    value={profile.yop || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doj">Date of Joining</Label>
                  <Input
                    id="doj"
                    value={formatDate(profile.doj)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repperson">Reporting Person</Label>
                  <Input
                    id="repperson"
                    value={profile.repperson || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1, profile.role.length)}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
              <CardDescription>Your banking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank</Label>
                  <Input
                    id="bank"
                    value={profile.bank || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch Name</Label>
                  <Input
                    id="branch"
                    value={profile.branch || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    value={profile.ifsc || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNo">Account No.</Label>
                  <Input
                    id="accountNo"
                    value={profile.accountNo || 'N/A'}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statutory Information */}
          <Card>
            <CardHeader>
              <CardTitle>Statutory Information</CardTitle>
              <CardDescription>Your statutory details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadharNo">Aadhar No.</Label>
                  <Input
                    id="aadharNo"
                    value={profile.aadharNo}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN No.</Label>
                  <Input
                    id="pan"
                    value={profile.pan}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uan">UAN No.</Label>
                  <Input
                    id="uan"
                    value={profile.uan || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pfNo">EPF No.</Label>
                  <Input
                    id="pfNo"
                    value={profile.pfNo || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esiNo">ESI No.</Label>
                  <Input
                    id="esiNo"
                    value={profile.esiNo || 'N/A'}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passport Information */}
          <Card>
            <CardHeader>
              <CardTitle>Passport Information</CardTitle>
              <CardDescription>Your passport details (if available)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportNo">Passport No.</Label>
                  <Input
                    id="passportNo"
                    value={profile.passportNo || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportType">Passport Type</Label>
                  <Input
                    id="passportType"
                    value={profile.passportType || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportpoi">Passport Place of Issue</Label>
                  <Input
                    id="passportpoi"
                    value={profile.passportpoi || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportdoi">Passport Date of Issue</Label>
                  <Input
                    id="passportdoi"
                    value={formatDate(profile.passportdoi)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportdoe">Passport Date of Expiry</Label>
                  <Input
                    id="passportdoe"
                    value={formatDate(profile.passportdoe)}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
