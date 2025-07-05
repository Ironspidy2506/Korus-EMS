import React, { useState, useEffect } from 'react';
import { Holiday, getAllHolidays, addHoliday, updateHoliday, deleteHoliday } from '@/utils/Holiday';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit, Trash2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const HRHoliday: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(false);

  const [newHoliday, setNewHoliday] = useState({
    name: '', 
    date: '', 
    type: 'Company', 
    description: '', 
    isRecurring: false
  });

  const [editHoliday, setEditHoliday] = useState({
    name: '', 
    date: '', 
    type: 'Company', 
    description: '', 
    isRecurring: false
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const data = await getAllHolidays();
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Failed to fetch holidays');
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error('Holiday name and date are required');
      return;
    }

    setLoading(true);
    try {
      await addHoliday(newHoliday);
      toast.success('Holiday added successfully');
      setIsAddDialogOpen(false);
      setNewHoliday({ name: '', date: '', type: 'Company', description: '', isRecurring: false });
      fetchHolidays();
    } catch (error) {
      console.error('Error adding holiday:', error);
      toast.error('Failed to add holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHoliday = async () => {
    if (!editHoliday.name || !editHoliday.date || !selectedHoliday?._id) {
      toast.error('Holiday name and date are required');
      return;
    }

    setLoading(true);
    try {
      await updateHoliday(selectedHoliday._id, editHoliday);
      toast.success('Holiday updated successfully');
      setIsEditDialogOpen(false);
      setSelectedHoliday(null);
      setEditHoliday({ name: '', date: '', type: 'Company', description: '', isRecurring: false });
      fetchHolidays();
    } catch (error) {
      console.error('Error updating holiday:', error);
      toast.error('Failed to update holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async () => {
    if (!selectedHoliday?._id) return;

    setLoading(true);
    try {
      await deleteHoliday(selectedHoliday._id);
      toast.success('Holiday deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedHoliday(null);
      fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    
    // Properly format the date for the input field
    let formattedDate = '';
    if (holiday.date) {
      if (typeof holiday.date === 'string') {
        // Handle MongoDB date string format like "2024-01-15T00:00:00.000Z"
        formattedDate = holiday.date.split('T')[0];
      } else {
        // If it's a Date object, format it as YYYY-MM-DD
        formattedDate = holiday.date.toISOString().split('T')[0];
      }
    }
    
    setEditHoliday({
      name: holiday.name,
      date: formattedDate,
      type: holiday.type,
      description: holiday.description,
      isRecurring: holiday.isRecurring
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'National': return 'cyan'; // Red
      case 'Religious': return 'purple'; // Purple
      case 'Company': return 'destructive'; // Blue
      case 'Optional': return 'warning'; // Yellow
      case 'Regional': return 'teal'; // Teal
      case 'Federal': return 'rose'; // Rose
      default: return 'secondary'; // Gray
    }
  };

  const sortedHolidays = [...holidays].sort((a, b) => {
    const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
    const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
    return dateA.getTime() - dateB.getTime();
  });

  const stats = {
    total: holidays.length,
    national: holidays.filter(h => h.type === 'National').length,
    company: holidays.filter(h => h.type === 'Company').length,
    upcoming: holidays.filter(h => {
      const holidayDate = typeof h.date === 'string' ? new Date(h.date) : h.date;
      return holidayDate > new Date();
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holiday Management</h1>
          <p className="text-gray-600">Manage company holidays and leave calendar</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Holiday</DialogTitle>
              <DialogDescription>Add a new holiday to the company calendar</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Holiday Name</Label>
                <Input
                  id="name"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  placeholder="e.g., New Year's Day"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newHoliday.type} onValueChange={(value) => setNewHoliday({...newHoliday, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Religious">Religious</SelectItem>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Optional">Optional</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="Federal">Federal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday({...newHoliday, description: e.target.value})}
                  placeholder="Holiday description..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={newHoliday.isRecurring}
                  onChange={(e) => setNewHoliday({...newHoliday, isRecurring: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isRecurring">Recurring annually</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddHoliday} disabled={loading}>
                {loading ? "Adding..." : "Add Holiday"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holidays</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">National Holidays</CardTitle>
            <CalendarDays className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.national}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Holidays</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.company}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holiday Calendar</CardTitle>
          <CardDescription>Manage company-wide holidays and observances</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHolidays.map((holiday) => (
                <TableRow key={holiday._id}>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell>
                    {formatDate(holiday.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeColor(holiday.type)}>
                      {holiday.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{holiday.description}</TableCell>
                  <TableCell>
                    <Badge variant={holiday.isRecurring ? 'success' : 'secondary'}>
                      {holiday.isRecurring ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(holiday)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDeleteDialog(holiday)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Holiday Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
            <DialogDescription>Update holiday information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Holiday Name</Label>
              <Input
                id="editName"
                value={editHoliday.name}
                onChange={(e) => setEditHoliday({...editHoliday, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDate">Date</Label>
              <Input
                id="editDate"
                type="date"
                value={editHoliday.date}
                onChange={(e) => setEditHoliday({...editHoliday, date: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editType">Type</Label>
              <Select value={editHoliday.type} onValueChange={(value) => setEditHoliday({...editHoliday, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="Religious">Religious</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Optional">Optional</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                  <SelectItem value="Federal">Federal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editHoliday.description}
                onChange={(e) => setEditHoliday({...editHoliday, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsRecurring"
                checked={editHoliday.isRecurring}
                onChange={(e) => setEditHoliday({...editHoliday, isRecurring: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="editIsRecurring">Recurring annually</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditHoliday} disabled={loading}>
              {loading ? "Updating..." : "Update Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Holiday</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedHoliday?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteHoliday} disabled={loading}>
              {loading ? "Deleting..." : "Delete Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRHoliday;
