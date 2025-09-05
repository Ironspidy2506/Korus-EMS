
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/Dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Star, Clock, CalendarCheck, Gift, Cake, HelpCircle, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Leave, getUserLeaves } from '@/utils/Leave';
import { Employee, getAllEmployees } from '@/utils/Employee';
import { getUserSalaries, Salary } from '@/utils/Salary';
import { Holiday, getAllHolidays } from '@/utils/Holiday';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRequests, setSalaryRequests] = useState<Salary[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [employeesRes, salaryRes, leaveRes, holidaysRes] = await Promise.all([
        getAllEmployees(),
        getUserSalaries(user._id),
        getUserLeaves(user._id),
        getAllHolidays(),
      ])

      setEmployees(employeesRes);
      setSalaryRequests(salaryRes.salaries || [])
      setLeaveRequests(leaveRes.leaves || []);
      setHolidays(holidaysRes || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };


  const capitalizeRole = (role?: string) => role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 15) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get upcoming birthdays (next 5)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    return employees
      .filter(emp => emp.dob)
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
      .slice(0, 4);
  };

  // Get upcoming holidays (next 30 days)
  const getUpcomingHolidays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate >= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const upcomingHolidays = getUpcomingHolidays();
  const upcomingBirthdays = getUpcomingBirthdays();

  const stats = [
    {
      title: 'Leave Records',
      value: `${leaveRequests.length || 0}`,
      icon: Calendar,
      color: 'text-blue-600',
      borderColor: 'border border-blue-600'
    },
    {
      title: 'Salary Records',
      value: `${salaryRequests.length || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      borderColor: 'border border-green-600'
    },
    {
      title: 'Upcoming Holidays',
      value: `${upcomingHolidays.length || 0}`,
      icon: CalendarCheck,
      color: 'text-yellow-500',
      borderColor: 'border border-yellow-600'
    },
    {
      title: 'Hours This Week',
      value: '',
      icon: Clock,
      color: 'text-purple-600',
      borderColor: 'border border-purple-600'
    }
  ];


  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'border-l-blue-500 bg-blue-50';
      case 'deadline': return 'border-l-red-500 bg-red-50';
      case 'review': return 'border-l-yellow-500 bg-yellow-50';
      case 'holiday': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Helper to format date as dd-mm-yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name}!</h1>
        <p className='text-base'>
          • {capitalizeRole(user.role)} Dashboard
        </p>
        <p className="text-primary-100 mt-1">Have a productive day ahead! Let's make today count!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto bg-blue-50 hover:bg-blue-100 border-blue-100 hover:border-blue-200 transition-colors" onClick={() => navigate(`/${user?.role}-dashboard/leave`)}>
              <Calendar className="h-8 w-8 mb-2 text-blue-600" />
              <span className="text-sm text-blue-700">Request Leave</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto bg-green-50 hover:bg-green-100 border-green-100 hover:border-green-200 transition-colors" onClick={() => navigate(`/${user?.role}-dashboard/salary`)}>
              <DollarSign className="h-8 w-8 mb-2 text-green-600" />
              <span className="text-sm text-green-700">View Salary</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto bg-purple-50 hover:bg-purple-100 border-purple-100 hover:border-purple-200 transition-colors" onClick={() => navigate(`/${user?.role}-dashboard/helpdesk`)}>
              <HelpCircle className="h-8 w-8 mb-2 text-purple-600" />
              <span className="text-sm text-purple-700">Visit Helpdesk</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto bg-pink-50 hover:bg-pink-100 border-pink-100 hover:border-pink-200 transition-colors" onClick={() => navigate(`/${user?.role}-dashboard/allowances`)}>
              <Gift className="h-8 w-8 mb-2 text-pink-600" />
              <span className="text-sm text-pink-700">View Allowances</span>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Birthdays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Upcoming Birthdays
            </CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBirthdays.map((employee, idx) => {
              const eventTypes = ['meeting', 'deadline', 'review', 'holiday'];
              const colorType = eventTypes[idx % eventTypes.length];
              const today = new Date();
              const empBirthday = new Date(employee.nextBirthday);
              const isToday = today.getDate() === empBirthday.getDate() && today.getMonth() === empBirthday.getMonth();
              return (
                <div key={employee._id} className={`p-3 rounded-lg border-l-4 ${getEventColor(colorType)} ${isToday ? 'ring-2 ring-pink-400 bg-pink-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{employee.employeeId}</p>
                        <span className="font-medium text-sm">{employee.name}</span>
                        {isToday && <Cake className="h-5 w-5 text-pink-500" />}
                      </div>
                      <p className="text-xs text-gray-600">{formatDate(employee.dob)}</p>
                      {isToday && (
                        <div className="mt-1 text-pink-600 font-bold text-xs flex items-center gap-1">
                          🎉 Happy Birthday! 🎂
                        </div>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-white rounded border capitalize">
                      {employee.department?.departmentName}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
