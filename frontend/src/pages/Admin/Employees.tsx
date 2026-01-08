import React, { useState, useEffect } from 'react';
import { Employee, getAllEmployees, addEmployee, editEmployee, deleteEmployee } from '@/utils/Employee';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Search, Edit, Trash2, Eye, Download, Clock, CheckCircle, Users, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllDepartments } from '@/utils/Department';
import axios from 'axios';
import * as XLSX from 'xlsx';
// No react-to-print import needed
import { useRef } from 'react';

interface EmployeeFormData {
  employeeId: string;
  name: string;
  email: string;
  korusEmail: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  designation: string;
  department: string;
  hod: string;
  qualification: string;
  yop: string;
  contactNo: number;
  altContactNo: number;
  permanentAddress: string;
  localAddress: string;
  aadharNo: string;
  pan: string;
  passportNo: string;
  passportType: string;
  passportpoi: string;
  passportdoi: string;
  passportdoe: string;
  nationality: string;
  uan: string;
  pfNo: string;
  esiNo: string;
  bank: string;
  branch: string;
  ifsc: string;
  accountNo: string;
  repperson: string;
  role: string;
  password: string;
  doj: string;
  profileImage: File | string | null;
}

const AdminEmployees: React.FC = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // reload to restore event listeners
    }
  };

  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    name: '',
    email: '',
    korusEmail: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    designation: '',
    department: '',
    hod: '',
    qualification: '',
    yop: '',
    contactNo: 0,
    altContactNo: 0,
    permanentAddress: '',
    localAddress: '',
    aadharNo: '',
    pan: '',
    passportNo: '',
    passportType: '',
    passportpoi: '',
    passportdoi: '',
    passportdoe: '',
    nationality: '',
    uan: '',
    pfNo: '',
    esiNo: '',
    bank: '',
    branch: '',
    ifsc: '',
    accountNo: '',
    repperson: '',
    role: '',
    password: '',
    doj: '',
    profileImage: null,
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await getAllEmployees();
      // Store all employees (including inactive ones)
      const sorted = data.sort((a: Employee, b: Employee) => a.employeeId - b.employeeId);
      setEmployees(sorted);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    }
  };

  // Filter to show only active employees in the table
  const activeEmployees = employees.filter((emp: Employee) => !emp.dol);
  
  const filteredEmployees = activeEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toString().includes(searchTerm)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, profileImage: file }));
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      korusEmail: '',
      dob: '',
      gender: '',
      maritalStatus: '',
      designation: '',
      department: '',
      hod: '',
      qualification: '',
      yop: '',
      contactNo: 0,
      altContactNo: 0,
      permanentAddress: '',
      localAddress: '',
      aadharNo: '',
      pan: '',
      passportNo: '',
      passportType: '',
      passportpoi: '',
      passportdoi: '',
      passportdoe: '',
      nationality: '',
      uan: '',
      pfNo: '',
      esiNo: '',
      bank: '',
      branch: '',
      ifsc: '',
      accountNo: '',
      repperson: '',
      role: '',
      password: '',
      doj: '',
      profileImage: null,
    });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const employeeToAdd: any = { ...formData };
      employeeToAdd.employeeId = Number(formData.employeeId);
      delete employeeToAdd._id;
      const result = await addEmployee(employeeToAdd);
      console.log(result);

      if (result) {
        toast({ title: 'Success', description: 'Employee added successfully' });
        setIsAddDialogOpen(false);
        resetForm();
        fetchEmployees();
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
      toast({ title: 'Error', description: 'Failed to add employee', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    try {
      const employeeToEdit: any = { ...formData };
      employeeToEdit.employeeId = Number(formData.employeeId);
      const result = await editEmployee(selectedEmployee._id!, employeeToEdit);
      if (result) {
        toast({ title: 'Success', description: 'Employee updated successfully' });
        setIsEditDialogOpen(false);
        setSelectedEmployee(null);
        resetForm();
        fetchEmployees();
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      toast({ title: 'Error', description: 'Failed to update employee', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const result = await deleteEmployee(id);
      if (result) {
        toast({ title: 'Success', description: 'Employee deleted successfully' });
        fetchEmployees();
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast({ title: 'Error', description: 'Failed to delete employee', variant: 'destructive' });
    }
  };

  const handleView = (employee: Employee) => {
    console.log(employee);

    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId.toString(),
      name: employee.name || '',
      email: employee.email || '',
      korusEmail: employee.korusEmail || '',
      dob: employee.dob ? employee.dob.split('T')[0] : '',
      gender: employee.gender || '',
      maritalStatus: employee.maritalStatus || '',
      designation: employee.designation || '',
      department: typeof employee.department === 'object' ? employee.department._id : employee.department,
      hod: employee.hod || '',
      qualification: employee.qualification || '',
      yop: employee.yop || '',
      contactNo: employee.contactNo || 0,
      altContactNo: employee.altContactNo || 0,
      permanentAddress: employee.permanentAddress || '',
      localAddress: employee.localAddress || '',
      aadharNo: employee.aadharNo || '',
      pan: employee.pan || '',
      passportNo: employee.passportNo || '',
      passportType: employee.passportType || '',
      passportpoi: employee.passportpoi || '',
      passportdoi: employee.passportdoi ? employee.passportdoi.split('T')[0] : '',
      passportdoe: employee.passportdoe ? employee.passportdoe.split('T')[0] : '',
      nationality: employee.nationality || '',
      uan: employee.uan || '',
      pfNo: employee.pfNo || '',
      esiNo: employee.esiNo || '',
      bank: employee.bank || '',
      branch: employee.branch || '',
      ifsc: employee.ifsc || '',
      accountNo: employee.accountNo || '',
      repperson: employee.repperson || '',
      role: employee.role || '',
      password: '',
      doj: employee.doj ? employee.doj.split('T')[0] : '',
      profileImage: null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
      await handleDeleteEmployee(employeeToDelete._id!);
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const formatDate = (date: string | Date): string => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderFormField = (
    name: keyof EmployeeFormData,
    label: string,
    type: string = 'text',
    required: boolean = false,
    placeholder?: string,
    options?: { value: string; label: string }[]
  ) => {
    const value = formData[name] as string;
    const nameStr = String(name);

    return (
      <div>
        <Label htmlFor={nameStr} className="block text-gray-700 font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {type === 'select' ? (
          <Select value={value} onValueChange={(val) => setFormData(prev => ({ ...prev, [name]: val }))}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === 'textarea' ? (
          <Textarea
            name={nameStr}
            id={nameStr}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={required}
          />
        ) : type === 'file' ? (
          <Input
            type="file"
            name={nameStr}
            id={nameStr}
            onChange={handleFileChange}
            accept="image/*"
          />
        ) : (
          <Input
            type={type}
            name={nameStr}
            id={nameStr}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={required}
            onWheel={type === 'number' ? (e) => e.currentTarget.blur() : undefined}
          />
        )}
      </div>
    );
  };

  const renderViewField = (label: string, value: any) => (
    <div>
      <Label className="block text-gray-700 font-medium mb-1">{label}</Label>
      <p className="text-gray-600">{value || '-'}</p>
    </div>
  );

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "Employees.xlsx");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage and view all employee information</p>
        </div>


        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Add a new employee to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-6">
              {/* Personal Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('name', 'Name', 'text', true, 'Enter Employee Name')}
                  {renderFormField('dob', 'Date of Birth', 'date', true)}
                  {renderFormField('gender', 'Gender', 'select', true, undefined, [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Transgender', label: 'Transgender' }
                  ])}
                  {renderFormField('maritalStatus', 'Marital Status', 'select', true, undefined, [
                    { value: 'Single', label: 'Single' },
                    { value: 'Married', label: 'Married' },
                    { value: 'Divorced', label: 'Divorced' },
                    { value: 'Widowed', label: 'Widowed' },
                    { value: 'Others', label: 'Others' }
                  ])}
                  {renderFormField('nationality', 'Nationality', 'text', false, 'Enter Nationality')}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('email', 'Email', 'email', true, 'Enter Personal Email')}
                  {renderFormField('korusEmail', 'Korus Email', 'email', false, 'Enter Korus Email (If Available)')}
                  {renderFormField('contactNo', 'Contact No.', 'number', true, 'Enter Contact No.')}
                  {renderFormField('altContactNo', 'Alternate Contact No.', 'number', false, 'Enter Alternate Contact No. (If Available)')}
                  {renderFormField('permanentAddress', 'Permanent Address', 'textarea', false, 'Enter Permanent Address')}
                  {renderFormField('localAddress', 'Local Address', 'textarea', false, 'Enter Local Address')}
                </div>
              </div>

              {/* Employment Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('employeeId', 'Employee ID', 'text', true, 'Enter Employee ID')}
                  {renderFormField('designation', 'Designation', 'text', true, 'Enter Designation')}
                  {renderFormField('department', 'Department', 'select', true, undefined,
                    departments.map(dep => ({ value: dep._id, label: dep.departmentName }))
                  )}
                  {renderFormField('hod', 'HOD', 'text', false, 'Enter Head of Department Name (If Available)')}
                  {renderFormField('qualification', 'Qualification', 'text', true, 'Enter Highest Qualification')}
                  {renderFormField('yop', 'Year of Passing', 'text', false, 'Enter Year of Passing of Highest Qualification')}
                  {renderFormField('doj', 'Date of Joining', 'date', true)}
                  {renderFormField('repperson', 'Reporting Person', 'text', false, 'Enter Reporting Person (If Available)')}
                  {renderFormField('role', 'Role', 'select', true, undefined, [
                    { value: 'employee', label: 'Employee' },
                    { value: 'lead', label: 'Lead' }
                  ])}
                  {renderFormField('password', 'Password', 'password', true, 'Enter Password')}
                </div>
              </div>

              {/* Bank Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('bank', 'Bank', 'text', true, 'Enter Bank Name')}
                  {renderFormField('branch', 'Branch Name', 'text', true, 'Enter Bank Branch Name')}
                  {renderFormField('ifsc', 'IFSC Code', 'text', true, 'Enter Bank IFSC Code')}
                  {renderFormField('accountNo', 'Account No.', 'text', true, 'Enter Account No.')}
                </div>
              </div>

              {/* Statutory Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Statutory Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('aadharNo', 'Aadhar No.', 'text', true, 'Enter Aadhar No.')}
                  {renderFormField('pan', 'PAN No.', 'text', true, 'Enter PAN No.')}
                  {renderFormField('uan', 'UAN No.', 'text', false, 'Enter UAN No.')}
                  {renderFormField('pfNo', 'EPF No.', 'text', false, 'Enter EPF Account No.')}
                  {renderFormField('esiNo', 'ESI No.', 'text', false, 'Enter ESI No.')}
                </div>
              </div>

              {/* Passport Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Passport Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('passportNo', 'Passport No.', 'text', false, 'Enter Passport No. (If Available)')}
                  {renderFormField('passportType', 'Passport Type', 'select', false, undefined, [
                    { value: 'P', label: 'P (Personal/Private)' },
                    { value: 'D', label: 'D (Diplomatic)' },
                    { value: 'O', label: 'O (Official/Service Passport)' },
                    { value: 'S', label: 'S (Special Passport)' },
                    { value: 'X', label: 'X (Stateless or Emergency Passport)' }
                  ])}
                  {renderFormField('passportpoi', 'Passport Place of Issue', 'text', false, 'Enter Passport Place of Issue (If Available)')}
                  {renderFormField('passportdoi', 'Passport Date of Issue', 'date', false)}
                  {renderFormField('passportdoe', 'Passport Date of Expiry', 'date', false)}
                </div>
              </div>

              {/* Profile Image */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Profile Image</h3>
                {renderFormField('profileImage', 'Profile Image', 'file', false)}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  Add Employee
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
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.filter(emp => !emp.dol).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="  text-2xl font-bold">{employees.filter(emp => emp.dol).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>Total: {activeEmployees.length} active employees</CardDescription>
          <div className="mt-4 flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees by Id or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleDownloadExcel}
                variant="outline"
                className="border border-gray-300 text-gray-700 hover:bg-gray-100 ml-4 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Emp ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee, index) => (
                <TableRow key={employee._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{employee.employeeId}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{typeof employee.department === 'object' ? employee.department.departmentName : ''}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{formatDate(employee.dob)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(employee)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(employee)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-6">
            {/* Personal Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('name', 'Name', 'text', true, 'Enter Employee Name')}
                {renderFormField('dob', 'Date of Birth', 'date', true)}
                {renderFormField('gender', 'Gender', 'select', true, undefined, [
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Transgender', label: 'Transgender' }
                ])}
                {renderFormField('maritalStatus', 'Marital Status', 'select', true, undefined, [
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Others', label: 'Others' }
                ])}
                {renderFormField('nationality', 'Nationality', 'text', false, 'Enter Nationality')}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('email', 'Email', 'email', true, 'Enter Personal Email')}
                {renderFormField('korusEmail', 'Korus Email', 'email', false, 'Enter Korus Email (If Available)')}
                {renderFormField('contactNo', 'Contact No.', 'number', true, 'Enter Contact No.')}
                {renderFormField('altContactNo', 'Alternate Contact No.', 'number', false, 'Enter Alternate Contact No. (If Available)')}
                {renderFormField('permanentAddress', 'Permanent Address', 'textarea', false, 'Enter Permanent Address')}
                {renderFormField('localAddress', 'Local Address', 'textarea', false, 'Enter Local Address')}
              </div>
            </div>

            {/* Employment Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('employeeId', 'Employee ID', 'text', true, 'Enter Employee ID')}
                {renderFormField('designation', 'Designation', 'text', true, 'Enter Designation')}
                {renderFormField('department', 'Department', 'select', true, undefined,
                  departments.map(dep => ({ value: dep._id, label: dep.departmentName }))
                )}
                {renderFormField('hod', 'HOD', 'text', false, 'Enter Head of Department Name (If Available)')}
                {renderFormField('qualification', 'Qualification', 'text', true, 'Enter Highest Qualification')}
                {renderFormField('yop', 'Year of Passing', 'text', false, 'Enter Year of Passing of Highest Qualification')}
                {renderFormField('doj', 'Date of Joining', 'date', true)}
                {renderFormField('repperson', 'Reporting Person', 'text', false, 'Enter Reporting Person (If Available)')}
                {renderFormField('role', 'Role', 'select', true, undefined, [
                  { value: 'employee', label: 'Employee' },
                  { value: 'lead', label: 'Lead' }
                ])}
                {renderFormField('password', 'Password', 'password', false, 'Enter New Password (Leave empty to keep current)')}
              </div>
            </div>

            {/* Bank Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Bank Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('bank', 'Bank', 'text', true, 'Enter Bank Name')}
                {renderFormField('branch', 'Branch Name', 'text', true, 'Enter Bank Branch Name')}
                {renderFormField('ifsc', 'IFSC Code', 'text', true, 'Enter Bank IFSC Code')}
                {renderFormField('accountNo', 'Account No.', 'text', true, 'Enter Account No.')}
              </div>
            </div>

            {/* Statutory Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Statutory Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('aadharNo', 'Aadhar No.', 'text', true, 'Enter Aadhar No.')}
                {renderFormField('pan', 'PAN No.', 'text', true, 'Enter PAN No.')}
                {renderFormField('uan', 'UAN No.', 'text', false, 'Enter UAN No.')}
                {renderFormField('pfNo', 'EPF No.', 'text', false, 'Enter EPF Account No.')}
                {renderFormField('esiNo', 'ESI No.', 'text', false, 'Enter ESI No.')}
              </div>
            </div>

            {/* Passport Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Passport Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('passportNo', 'Passport No.', 'text', false, 'Enter Passport No. (If Available)')}
                {renderFormField('passportType', 'Passport Type', 'select', false, undefined, [
                  { value: 'P', label: 'P (Personal/Private)' },
                  { value: 'D', label: 'D (Diplomatic)' },
                  { value: 'O', label: 'O (Official/Service Passport)' },
                  { value: 'S', label: 'S (Special Passport)' },
                  { value: 'X', label: 'X (Stateless or Emergency Passport)' }
                ])}
                {renderFormField('passportpoi', 'Passport Place of Issue', 'text', false, 'Enter Passport Place of Issue (If Available)')}
                {renderFormField('passportdoi', 'Passport Date of Issue', 'date', false)}
                {renderFormField('passportdoe', 'Passport Date of Expiry', 'date', false)}
              </div>
            </div>

            {/* Profile Image */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Profile Image</h3>
              {renderFormField('profileImage', 'Profile Image', 'file', false)}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                Update Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>View complete employee information</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div>
              <Button onClick={handlePrint} className="mb-4" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <div className="space-y-6 printable-employee-profile" ref={printRef}>
                {/* Profile Image */}
                {selectedEmployee.userId.profileImage && typeof selectedEmployee.userId.profileImage === 'string' && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={selectedEmployee.userId.profileImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border"
                    />
                  </div>
                )}
                {/* Personal Information */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderViewField('Employee ID', selectedEmployee.employeeId)}
                    {renderViewField('Name', selectedEmployee.name)}
                    {renderViewField('Date of Birth', formatDate(selectedEmployee.dob))}
                    {renderViewField('Gender', selectedEmployee.gender)}
                    {renderViewField('Marital Status', selectedEmployee.maritalStatus)}
                    {renderViewField('Nationality', selectedEmployee.nationality)}
                  </div>
                </div>
                {/* Contact Information */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderViewField('Email', selectedEmployee.email)}
                    {renderViewField('Korus Email', selectedEmployee.korusEmail)}
                    {renderViewField('Contact No.', selectedEmployee.contactNo)}
                    {renderViewField('Alternate Contact No.', selectedEmployee.altContactNo)}
                    {renderViewField('Permanent Address', selectedEmployee.permanentAddress)}
                    {renderViewField('Local Address', selectedEmployee.localAddress)}
                  </div>
                </div>
                {/* Employment Information */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderViewField('Designation', selectedEmployee.designation)}
                    {renderViewField('Department', typeof selectedEmployee.department === 'object' ? selectedEmployee.department.departmentName : '')}
                    {renderViewField('HOD', selectedEmployee.hod)}
                    {renderViewField('Qualification', selectedEmployee.qualification)}
                    {renderViewField('Year of Passing', selectedEmployee.yop)}
                    {renderViewField('Date of Joining', selectedEmployee.doj ? formatDate(selectedEmployee.doj) : null)}
                    {renderViewField('Reporting Person', selectedEmployee.repperson)}
                    {renderViewField('Role', selectedEmployee.role.slice(0, 1).toUpperCase() + selectedEmployee.role.slice(1, selectedEmployee.role.length).toLowerCase())}
                  </div>
                </div>
                {/* Bank Information */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Bank Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderViewField('Bank', selectedEmployee.bank)}
                    {renderViewField('Branch Name', selectedEmployee.branch)}
                    {renderViewField('IFSC Code', selectedEmployee.ifsc)}
                    {renderViewField('Account No.', selectedEmployee.accountNo)}
                  </div>
                </div>
                {/* Statutory Information */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Statutory Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderViewField('Aadhar No.', selectedEmployee.aadharNo)}
                    {renderViewField('PAN No.', selectedEmployee.pan)}
                    {renderViewField('UAN No.', selectedEmployee.uan)}
                    {renderViewField('EPF No.', selectedEmployee.pfNo)}
                    {renderViewField('ESI No.', selectedEmployee.esiNo)}
                  </div>
                </div>
                {/* Passport Information */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Passport Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderViewField('Passport No.', selectedEmployee.passportNo)}
                    {renderViewField('Passport Type', selectedEmployee.passportType)}
                    {renderViewField('Passport Place of Issue', selectedEmployee.passportpoi)}
                    {renderViewField('Passport Date of Issue', selectedEmployee.passportdoi ? formatDate(selectedEmployee.passportdoi) : null)}
                    {renderViewField('Passport Date of Expiry', selectedEmployee.passportdoe ? formatDate(selectedEmployee.passportdoe) : null)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-red-600">{employeeToDelete?.name}</span>?
              <br />This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteEmployee}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-employee-profile, .printable-employee-profile * { visibility: visible; }
          .printable-employee-profile { position: absolute; left: 0; top: 0; width: 100vw; background: white; z-index: 9999; }
        }
      `}</style>
    </div>
  );
}

export default AdminEmployees;
