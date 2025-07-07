import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, CheckCircle, Clock, FileText, Plus, Edit, Search, Calendar, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getAllEmployees, updateEmployeeJourney } from '@/utils/Employee';
import { Employee } from '@/utils/Employee';
import * as XLSX from 'xlsx';

const HROnboarding: React.FC = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    doj: '',
    dol: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getAllEmployees();
      const sorted = response.sort((a: Employee, b: Employee) => a.employeeId - b.employeeId);
      setEmployees(sorted);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    // First filter to only show employees with DOL (inactive employees)
    const employeesWithDOL = employees.filter(emp => emp.dol);

    if (!searchTerm.trim()) {
      setFilteredEmployees(employeesWithDOL);
      return;
    }

    const filtered = employeesWithDOL.filter(emp =>
      emp.employeeId.toString().includes(searchTerm) ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        employeeId: employee._id,
        doj: employee.doj ? employee.doj.split('T')[0] : '',
        dol: employee.dol ? employee.dol.split('T')[0] : '',
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId) {
      toast({
        title: 'Error',
        description: 'Please select an employee',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        doj: formData.doj || undefined,
        dol: formData.dol || undefined,
      };

      const response = await updateEmployeeJourney(formData.employeeId, payload);
      if (response.data.success) {
        toast({
          title: 'Success',
          description: `${response.data.message}`,
        });
      } else {
        toast({
          title: 'Error',
          description: `${response.data.message}`,
        });
      }


      setIsDialogOpen(false);
      setSelectedEmployee(null);
      setFormData({
        employeeId: '',
        doj: '',
        dol: '',
      });
      setEmployeeSearchTerm('');
      fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee dates',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="success" className="bg-green-100 text-green-800">
        Active
      </Badge>
    ) : (
      <Badge variant="destructive" >
        Inactive
      </Badge>
    );
  };

  const stats = {
    total: employees.length,
    active: employees.filter(emp => !emp.dol).length,
    inactive: employees.filter(emp => emp.dol).length,
    withDOJ: employees.filter(emp => emp.doj).length,
  };

  // Filter employees for the searchable dropdown
  const searchableEmployees = employees.filter(emp =>
    emp.employeeId.toString().includes(employeeSearchTerm) ||
    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = filteredEmployees.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Department': emp.department?.departmentName || '-',
      'Date of Joining': formatDate(emp.doj || ''),
      'Date of Leaving': formatDate(emp.dol || ''),
      'Status': emp.dol ? 'Inactive' : 'Active',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inactive Employees');
    XLSX.writeFile(workbook, 'inactive_employees.xlsx');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="text-gray-600">Manage employee dates and status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add/Edit Employee Dates
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Employee Dates Management</DialogTitle>
              <DialogDescription>Search for an employee and update their DOJ/DOL dates</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="employee">Search Employee</Label>
                <Input
                  placeholder="Search by Employee ID or Name..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <Select onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee from search results" />
                  </SelectTrigger>
                  <SelectContent>
                    {searchableEmployees
                      .sort((a: any, b: any) => (a.employeeId - b.employeeId))
                      .map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.employeeId} - {employee.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEmployee && (
                <>
                  <div>
                    <Label htmlFor="selectedEmployee">Selected Employee</Label>
                    <Input
                      value={`${selectedEmployee.employeeId} - ${selectedEmployee.name}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="doj">Date of Joining (DOJ)</Label>
                    <Input
                      type="date"
                      name="doj"
                      value={formData.doj}
                      onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dol">Date of Leaving (DOL)</Label>
                    <Input
                      type="date"
                      name="dol"
                      value={formData.dol}
                      onChange={(e) => setFormData({ ...formData, dol: e.target.value })}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty if employee is still active. Setting a DOL will mark employee as inactive.
                    </p>
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="submit" disabled={!selectedEmployee}>
                  Update Dates
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inactive Employees</CardTitle>
          <CardDescription>Employees who have left the company (with DOL)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Employee ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <Button
              variant="outline"
              className="ml-auto"
              onClick={handleDownloadExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date of Joining</TableHead>
                <TableHead>Date of Leaving</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell className="font-medium">
                    {employee.employeeId}
                  </TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.department?.departmentName || '-'}</TableCell>
                  <TableCell>{formatDate(employee.doj || '')}</TableCell>
                  <TableCell>{formatDate(employee.dol || '')}</TableCell>
                  <TableCell>{getStatusBadge(employee.dol)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmployeeSelect(employee._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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

export default HROnboarding;
