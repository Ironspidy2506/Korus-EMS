import React, { useEffect, useState } from 'react';
import {
  Employee, getAllEmployees
} from '@/utils/Employee';
import { Department, getAllDepartments } from '@/utils/Department';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/Dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Calendar, MessageSquare, Clock, AlertCircle, Gift, FileText, Cake } from 'lucide-react';
import axios from 'axios';
import { getAllLeaves } from '@/utils/Leave';

interface LeaveRequest {
  _id: string;
  employeeId: {
    name: string;
    employeeId: string;
    dol?: string; // Date of Leaving (optional)
  };
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [employeesRes, departmentsRes, leaveRes] = await Promise.all([
        getAllEmployees(),
        getAllDepartments(),
        getAllLeaves(),
      ]);

      // Filter employees to only include those without a Date of Leaving (DOL)
      const activeEmployees = employeesRes.filter((emp: Employee) => !emp.dol);
      setEmployees(activeEmployees);
      setDepartments(departmentsRes);
      setLeaveRequests(leaveRes.leaves || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Get upcoming birthdays (next 5)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    return employees
      .filter(emp => emp.dob && !emp.dol) // Only include active employees (without DOL)
      .map(emp => {
        const dob = new Date(emp.dob);
        const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

        // If birthday has passed this year, set to next year
        if (nextBirthday < today) {
          nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        return {
          ...emp,
          nextBirthday,
          daysUntil: Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 6);
  };

  // Get pending leave requests
  const getPendingLeaves = () => {
    return leaveRequests
      .filter(leave => leave.status === 'pending' && !leave.employeeId?.dol) // Only include leaves from active employees (without DOL)
      .slice(0, 5);
  };

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length.toString(),
      icon: Users,
    },
    {
      title: 'Active Employees',
      value: employees.filter(emp => !emp.dol).length.toString(),
      icon: UserPlus,
    },
    {
      title: 'Inactive Employees',
      value: employees.filter(emp => emp.dol).length.toString(),
      icon: Clock,
    },
    {
      title: 'Departments',
      value: departments.length.toString(),
      icon: FileText,
    },
    {
      title: 'Leave Requests',
      value: leaveRequests.filter(leave => leave.status === 'pending' && !leave.employeeId?.dol).length.toString(), // Only count leaves from active employees
      icon: Calendar,
    }
  ];

  const upcomingBirthdays = getUpcomingBirthdays();
  const pendingLeaves = getPendingLeaves();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-primary-50">Manage your HR operations efficiently and keep employees happy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Birthdays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Upcoming Birthdays
            </CardTitle>
            <CardDescription>Next 6 employee birthdays</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBirthdays.length > 0 ? (
              <div className="space-y-3">
                {upcomingBirthdays.map((employee, index) => {
                  const bgColors = ["bg-blue-50", "bg-green-50", "bg-yellow-50"];
                  const dotColors = ["bg-blue-500", "bg-green-500", "bg-yellow-500"];
                  const tagColors = ["bg-blue-100 text-blue-800", "bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800"];

                  const colorIndex = index % bgColors.length;
                  const isToday = employee.daysUntil === 0;
                  const cardBg = isToday ? "bg-pink-100" : bgColors[colorIndex];
                  const tagColor = isToday ? "bg-pink-200 text-pink-800" : tagColors[colorIndex];
                  return (
                    <div key={employee._id} className={`flex items-center space-x-3 p-3 ${cardBg} rounded-lg`}>
                      <div className={`w-2 h-2 ${isToday ? "bg-pink-500" : dotColors[colorIndex]} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-1">
                          {employee.employeeId} - {employee.name} {isToday && <span title="Birthday Today" className="inline-block align-middle">🎂</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(employee.dob)} •{" "}
                          {employee.daysUntil === 0 ? "Today" : employee.daysUntil === 1 ? "1 day away" : `${employee.daysUntil} days away`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${tagColor}`}>
                        {employee.department?.departmentName}
                      </span>
                    </div>
                  );
                })}

              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming birthdays</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>Recent leave requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div key={leave._id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{leave.employeeId.employeeId} - {leave.employeeId.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                    <p className="text-xs text-gray-400">{leave.reason}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded capitalize">
                    {leave.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No pending leave requests</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
