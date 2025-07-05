
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu,
  X,
  Home,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Star,
  Briefcase,
  MessageSquare,
  HelpCircle,
  UserPlus,
  Mail,
  CalendarCheck,
  Gift,
  Lock,
  User,
  Award
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: `/${user?.role}-dashboard` }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: Users, label: 'Employees', path: '/admin-dashboard/employees' },
          { icon: Building2, label: 'Departments', path: '/admin-dashboard/departments' },
          { icon: Calendar, label: 'Leave', path: '/admin-dashboard/leave' },
          { icon: Star, label: 'Appraisal', path: '/admin-dashboard/appraisal' },
          { icon: DollarSign, label: 'Salary', path: '/admin-dashboard/salary' },
          { icon: Briefcase, label: 'CTC', path: '/admin-dashboard/ctc' },
          { icon: Gift, label: 'Fixed Allowances', path: '/admin-dashboard/fixed-allowances' },
          { icon: Award, label: 'Variable Allowances', path: '/admin-dashboard/allowances' }
        ];
      case 'accounts':
        return [
          ...baseItems,
          { icon: Users, label: 'Employees', path: '/accounts-dashboard/employees' },
          { icon: Building2, label: 'Departments', path: '/accounts-dashboard/departments' },
          { icon: Calendar, label: 'Leave', path: '/accounts-dashboard/leave' },
          { icon: Star, label: 'Appraisal', path: '/accounts-dashboard/appraisal' },
          { icon: DollarSign, label: 'Salary', path: '/accounts-dashboard/salary' },
          { icon: Briefcase, label: 'CTC', path: '/accounts-dashboard/ctc' },
          { icon: Gift, label: 'Fixed Allowances', path: '/accounts-dashboard/fixed-allowances' },
          { icon: Award, label: 'Variable Allowances', path: '/accounts-dashboard/allowances' }
        ];
      case 'hr':
        return [
          ...baseItems,
          { icon: Users, label: 'Employees', path: '/hr-dashboard/employees' },
          { icon: Building2, label: 'Departments', path: '/hr-dashboard/departments' },
          { icon: Users, label: 'Users', path: '/hr-dashboard/users' },
          { icon: Calendar, label: 'Leave', path: '/hr-dashboard/leave' },
          { icon: CalendarCheck, label: 'Holiday', path: '/hr-dashboard/holiday' },
          { icon: Star, label: 'Appraisal', path: '/hr-dashboard/appraisal' },
          { icon: UserPlus, label: 'Onboarding/Offboarding', path: '/hr-dashboard/onboarding' },
          { icon: MessageSquare, label: 'Messages', path: '/hr-dashboard/messages' },
          { icon: HelpCircle, label: 'Helpdesk', path: '/hr-dashboard/helpdesk' }
        ];
      case 'employee':
        return [
          ...baseItems,
          { icon: User, label: 'Profile', path: '/employee-dashboard/profile' },
          { icon: CalendarCheck, label: 'Holidays', path: '/employee-dashboard/holidays' },
          { icon: Calendar, label: 'Leave', path: '/employee-dashboard/leave' },
          { icon: DollarSign, label: 'Salary', path: '/employee-dashboard/salary' },
          { icon: Gift, label: 'Fixed Allowances', path: '/employee-dashboard/fixed-allowances' },
          { icon: Award, label: 'Variable Allowances', path: '/employee-dashboard/allowances' },
          { icon: Star, label: 'Appraisal', path: '/employee-dashboard/appraisal' },
          { icon: MessageSquare, label: 'Messages', path: '/employee-dashboard/messages' },
          { icon: HelpCircle, label: 'Helpdesk', path: '/employee-dashboard/helpdesk' }
        ];

      case 'lead':
        return [
          ...baseItems,
          { icon: User, label: 'Profile', path: '/lead-dashboard/profile' },
          { icon: CalendarCheck, label: 'Holidays', path: '/lead-dashboard/holidays' },
          { icon: Calendar, label: 'Leave', path: '/lead-dashboard/leave' },
          { icon: DollarSign, label: 'Salary', path: '/lead-dashboard/salary' },
          { icon: Gift, label: 'Fixed Allowances', path: '/lead-dashboard/fixed-allowances' },
          { icon: Award, label: 'Variable Allowances', path: '/lead-dashboard/allowances' },
          { icon: Star, label: 'Appraisal', path: '/lead-dashboard/appraisal' },
          { icon: MessageSquare, label: 'Messages', path: '/lead-dashboard/messages' },
          { icon: HelpCircle, label: 'Helpdesk', path: '/lead-dashboard/helpdesk' }
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <img src="/uploads/Korus.png" alt="KORUS" className="h-8 w-8" />
            <span className="text-xl font-bold text-primary">KORUS</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-primary/10 hover:text-primary"
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="w-full flex justify-end items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role.toUpperCase()}</p>
            </div>
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-primary text-white">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>

        </header>

        {/* Page Content */}
        <main className="p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
