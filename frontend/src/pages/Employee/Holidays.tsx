import React, { useState, useEffect } from 'react';
import { Holiday, getAllHolidays } from '@/utils/Holiday';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, CalendarCheck, Gift } from 'lucide-react';

const EmployeeHolidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const data = await getAllHolidays();
        setHolidays(data);
      } catch (err) {
        setError('Failed to fetch holidays');
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holiday.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || holiday.type === typeFilter;
    return matchesSearch && matchesType;
  })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'National': return 'info';
      case 'Religious': return 'success';
      case 'Company': return 'warning';
      case 'Optional': return 'destructive';
      case 'Regional': return 'teal';
      case 'Federal': return 'rose';
      default: return 'secondary';
    }
  };

  const getUpcomingHolidays = () => {
    const today = new Date();
    const upcoming = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
    return upcoming;
  };

  const getHolidaysByType = () => {
    const types = ['National', 'Religious', 'Company', 'Optional', 'Regional', 'Federal'];
    return types.map(type => ({
      type,
      count: holidays.filter(h => h.type === type).length
    }));
  };

  const upcomingHolidays = getUpcomingHolidays();
  const holidaysByType = getHolidaysByType();

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holidays</h1>
          <p className="text-gray-600">View company holidays and plan your time off</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className=' border border-purple-500'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holidays</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holidays.length}</div>
          </CardContent>
        </Card>
        {holidaysByType.map((item) => (
          <Card key={item.type} className={`${getTypeBadgeColor(item.type) === 'info' ? 'border-blue-500' :
            getTypeBadgeColor(item.type) === 'success' ? 'border-green-500' :
              getTypeBadgeColor(item.type) === 'warning' ? 'border-yellow-500' :
                getTypeBadgeColor(item.type) === 'destructive' ? 'border-red-500' :
                  getTypeBadgeColor(item.type) === 'teal' ? 'border-teal-500' :
                    getTypeBadgeColor(item.type) === 'rose' ? 'border-rose-500' :
                      'border-l-gray-500'
            }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.type}</CardTitle>
              <Badge variant={getTypeBadgeColor(item.type)}>{item.count}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Upcoming Holidays
            </CardTitle>
            <CardDescription>Next few holidays coming up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getTypeBadgeColor(holiday.type) === 'info' ? 'bg-blue-500' : getTypeBadgeColor(holiday.type) === 'success' ? 'bg-green-500' : getTypeBadgeColor(holiday.type) === 'warning' ? 'bg-yellow-500' : getTypeBadgeColor(holiday.type) === 'teal' ? 'bg-teal-500' : getTypeBadgeColor(holiday.type) === 'rose' ? 'bg-rose-500' : 'bg-red-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{holiday.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(holiday.date)}</p>
                </div>
                <Badge variant={getTypeBadgeColor(holiday.type)} className="text-xs">
                  {holiday.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Holiday Statistics
            </CardTitle>
            <CardDescription>Holiday breakdown by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {holidaysByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={getTypeBadgeColor(item.type)}>
                    {item.type}
                  </Badge>
                  <span className="text-sm font-medium">{item.type} Holidays</span>
                </div>
                <span className="text-lg font-bold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Holidays</CardTitle>
          <CardDescription>Complete list of company holidays for the year</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search holidays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="National">National</SelectItem>
                <SelectItem value="Religious">Religious</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
                <SelectItem value="Optional">Optional</SelectItem>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Federal">Federal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-300 hover:bg-gray-300'>
                <TableHead className="font-bold text-black">S.No</TableHead>
                <TableHead className="font-bold text-black">Holiday Name</TableHead>
                <TableHead className="font-bold text-black">Date</TableHead>
                <TableHead className="font-bold text-black">Type</TableHead>
                <TableHead className="font-bold text-black">Description</TableHead>
                <TableHead className="font-bold text-black">Recurring</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHolidays.map((holiday, index) => (
                <TableRow key={holiday._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell>{formatDate(holiday.date)}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeColor(holiday.type)}>
                      {holiday.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{holiday.description}</TableCell>
                  <TableCell>
                    <Badge variant={holiday.isRecurring ? 'teal' : 'secondary'}>
                      {holiday.isRecurring ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeHolidays;
