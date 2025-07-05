
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/Dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Star, Clock, CalendarCheck, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LeadDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Leave Balance',
      value: '18 days',
      icon: Calendar
    },
    {
      title: 'This Month Salary',
      value: '$4,250',
      icon: DollarSign
    },
    {
      title: 'Performance Score',
      value: '4.2/5',
      icon: Star
    },
    {
      title: 'Hours This Week',
      value: '38h',
      icon: Clock
    }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Team Meeting', date: '2024-01-15', time: '10:00 AM', type: 'meeting' },
    { id: 2, title: 'Project Deadline', date: '2024-01-18', time: '5:00 PM', type: 'deadline' },
    { id: 3, title: 'Performance Review', date: '2024-01-22', time: '2:00 PM', type: 'review' },
    { id: 4, title: 'Holiday - MLK Day', date: '2024-01-15', time: 'All Day', type: 'holiday' }
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Good morning, {user?.name}!</h1>
        <p className="text-primary-50">
          {user?.role} Dashboard • 
        </p>
        <p className="text-primary-100 mt-2">Have a productive day ahead!</p>
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
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Calendar className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm">Request Leave</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <DollarSign className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm">View Payslip</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm">Clock In/Out</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Gift className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm">Benefits</span>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className={`p-3 rounded-lg border-l-4 ${getEventColor(event.type)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-600">{event.date} at {event.time}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-white rounded border capitalize">
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Leave request approved</p>
                <p className="text-xs text-gray-500">Your vacation leave for Jan 25-27 has been approved</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payslip generated</p>
                <p className="text-xs text-gray-500">December 2024 payslip is now available</p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Performance review scheduled</p>
                <p className="text-xs text-gray-500">Q4 performance review meeting scheduled for Jan 22</p>
                <p className="text-xs text-gray-400">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDashboard;
