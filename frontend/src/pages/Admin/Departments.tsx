import React, { useState, useEffect } from 'react';
import { Employee, getAllEmployees } from '@/utils/Employee';
import { Department, getAllDepartments, addDepartment, updateDepartment, deleteDepartment } from '@/utils/Department';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Plus, Edit, Trash2, Users, Download, Eye, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewEmployeesDialogOpen, setIsViewEmployeesDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  const [newDepartment, setNewDepartment] = useState({
    departmentId: '',
    departmentName: '',
    description: ''
  });

  const [editDepartment, setEditDepartment] = useState({
    departmentId: '',
    departmentName: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      const sorted = data.sort((a: Department, b: Department) =>
        a.departmentId.localeCompare(b.departmentId)
      );
      setDepartments(sorted);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error("Failed to fetch departments");
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      const filtered = data.filter((emp: Employee) => !emp.dol);
      const sorted = filtered.sort((a: Employee, b: Employee) => a.employeeId - b.employeeId);
      setEmployees(sorted);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Failed to fetch employees");
    }
  };

  const getEmployeeCount = (departmentId: string) => {
    return employees.filter(
      (emp) => emp.department?._id === departmentId
    ).length;
  };

  const getEmployeesByDepartment = (departmentId: string) => {
    return employees.filter(
      (emp) => emp.department?._id === departmentId
    );
  };

  const getFilteredEmployees = (departmentId: string) => {
    const departmentEmployees = getEmployeesByDepartment(departmentId);
    if (!employeeSearchTerm) return departmentEmployees;
    
    return departmentEmployees.filter(emp => 
      emp.employeeId.toString().toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    );
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.departmentId || !newDepartment.departmentName) {
      toast.error("Department ID and Name are required");
      return;
    }

    setLoading(true);
    try {
      await addDepartment(newDepartment);
      toast.success("Department added successfully");
      setIsAddDialogOpen(false);
      setNewDepartment({ departmentId: '', departmentName: '', description: '' });
      fetchDepartments();
    } catch (error) {
      console.error("Failed to add department:", error);
      toast.error("Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!editDepartment.departmentId || !editDepartment.departmentName || !selectedDepartment?._id) {
      toast.error("Department ID and Name are required");
      return;
    }

    setLoading(true);
    try {
      await updateDepartment(selectedDepartment._id, editDepartment);
      toast.success("Department updated successfully");
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
      setEditDepartment({ departmentId: '', departmentName: '', description: '' });
      fetchDepartments();
    } catch (error) {
      console.error("Failed to update department:", error);
      toast.error("Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment?._id) return;

    setLoading(true);
    try {
      await deleteDepartment(selectedDepartment._id);
      toast.success("Department deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
      toast.error("Failed to delete department");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = async (department: Department) => {
    setSelectedDepartment(department);
    setEditDepartment({
      departmentId: department.departmentId,
      departmentName: department.departmentName,
      description: department.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const openViewEmployeesDialog = (department: Department) => {
    setSelectedDepartment(department);
    setEmployeeSearchTerm('');
    setIsViewEmployeesDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600">Manage organizational departments and structure</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>Create a new department in the organization</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departmentId" className="text-right">Department ID</Label>
                <Input
                  id="departmentId"
                  value={newDepartment.departmentId}
                  onChange={(e) => setNewDepartment({ ...newDepartment, departmentId: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., DEP001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departmentName" className="text-right">Department Name</Label>
                <Input
                  id="departmentName"
                  value={newDepartment.departmentName}
                  onChange={(e) => setNewDepartment({ ...newDepartment, departmentName: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Human Resources"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Department description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDepartment} disabled={loading}>
                {loading ? "Adding..." : "Add Department"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Employees</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center w-full">
            <div>
              <CardTitle>All Departments</CardTitle>
              <CardDescription>Manage and view all organizational departments</CardDescription>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => {
                  const tableData = departments.map((department) => ({
                    'Department ID': department.departmentId,
                    'Department Name': department.departmentName,
                    'Employees': employees.filter(emp => emp.department?._id === department._id).length,
                    'Description': department.description || '',
                  }));
                  const worksheet = XLSX.utils.json_to_sheet(tableData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
                  XLSX.writeFile(workbook, 'Departments.xlsx');
                }}
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
                <TableHead>S.No.</TableHead>
                <TableHead>Department ID</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department, index) => (
                <TableRow key={department._id}>
                  <TableCell><div className="font-medium">{index + 1}</div></TableCell>
                  <TableCell className="font-medium">{department.departmentId}</TableCell>
                  <TableCell className="font-medium">{department.departmentName}</TableCell>
                  <TableCell>{getEmployeeCount(department._id!)}</TableCell>
                  <TableCell className="max-w-xs truncate">{department.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewEmployeesDialog(department)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(department)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(department)}
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

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDepartmentId" className="text-right">Department ID</Label>
              <Input
                id="editDepartmentId"
                value={editDepartment.departmentId}
                onChange={(e) => setEditDepartment({ ...editDepartment, departmentId: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDepartmentName" className="text-right">Department Name</Label>
              <Input
                id="editDepartmentName"
                value={editDepartment.departmentName}
                onChange={(e) => setEditDepartment({ ...editDepartment, departmentName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDescription" className="text-right">Description</Label>
              <Textarea
                id="editDescription"
                value={editDepartment.description}
                onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDepartment} disabled={loading}>
              {loading ? "Updating..." : "Update Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDepartment?.departmentName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDepartment} disabled={loading}>
              {loading ? "Deleting..." : "Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employees Dialog */}
      <Dialog open={isViewEmployeesDialogOpen} onOpenChange={setIsViewEmployeesDialogOpen}>
        <DialogContent className="sm:max-w-[900px] h-[600px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Employees in {selectedDepartment?.departmentName}</DialogTitle>
            <DialogDescription>
              Search and view employees within this department.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search by Employee ID or Name..."
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setEmployeeSearchTerm('')} variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-y-auto h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredEmployees(selectedDepartment?._id!).map((emp, index) => (
                  <TableRow key={emp._id}>
                    <TableCell><div className="font-medium">{index + 1}</div></TableCell>
                    <TableCell className="font-medium">{emp.employeeId}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.designation || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDepartments;
