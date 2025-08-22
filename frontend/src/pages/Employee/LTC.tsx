import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Download, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllEmployees } from '@/utils/Employee';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Employee } from '@/utils/Employee';
import { getAllDepartments, Department } from '@/utils/Department';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { getUserLTCs, addLTC, updateLTC, deleteLTC } from '@/utils/LTC.tsx';

interface LTC {
  _id: string;
  employeeId: Employee;
  department: Department;
  serviceCompletionFrom: string;
  serviceCompletionTo: string;
  leavePeriodFrom: string;
  leavePeriodTo: string;
  reimbursementAmount: number;
  status: string;
  approvedBy: string;
  attachment?: {
    fileName: string;
    fileType: string;
    fileData: Buffer;
  };
  createdAt: string;
  updatedAt: string;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'secondary';
  }
};

const initialForm = {
  _id: '',
  employeeId: '',
  department: '',
  serviceCompletionFrom: '',
  serviceCompletionTo: '',
  leavePeriodFrom: '',
  leavePeriodTo: '',
  reimbursementAmount: '',
  attachment: null,
};

const EmployeeLTC: React.FC = () => {
  const { user } = useAuth();
  const [ltcs, setLtcs] = useState<LTC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ltcToDelete, setLtcToDelete] = useState<string | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');


  useEffect(() => {
    fetchLTCs();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchLTCs = async () => {
    try {
      setLoading(true);
      const data = await getUserLTCs(user._id);
      setLtcs(data);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch LTC requests');
      setLtcs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      const department = departments.find(dept => dept._id === employee.department._id);
      setFormData(prev => ({
        ...prev,
        employeeId: employee._id,
        department: employee.department,
        departmentName: department?.departmentName || '',
        departmentCode: department?.departmentId || ''
      }));
      setEmployeeError(null);
    }
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setIsEdit(false);
    setShowModal(true);
    // Set the current user as the selected employee
    const currentEmployee = employees.find(emp => emp.userId._id === user._id);
    setSelectedEmployee(currentEmployee || null);
    setEmployeeSearchTerm('');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialForm);
    setSelectedEmployee(null);
    setEmployeeError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    
    // Define fields that employees are allowed to update
    const allowedFields = [
      'serviceCompletionFrom',
      'serviceCompletionTo', 
      'leavePeriodFrom',
      'leavePeriodTo',
      'reimbursementAmount',
      'attachment'
    ];

    Object.keys(formData).forEach(key => {
      // Only send allowed fields (exclude admin-specific fields)
      if (allowedFields.includes(key)) {
        if (key === 'attachment' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key === 'department' && typeof formData[key] === 'object') {
          formDataToSend.append('department', formData[key]._id || '');
        } else if (key === 'employeeId') {
          // Always use the current user's employee ID
          formDataToSend.append('employeeId', selectedEmployee?._id || '');
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    // Always include department and employeeId for both add and edit
    if (selectedEmployee?.department?._id) {
      formDataToSend.append('department', selectedEmployee.department._id);
    }
    if (selectedEmployee?._id) {
      formDataToSend.append('employeeId', selectedEmployee._id);
    }

    // Debug logging
    console.log('Form data being sent:', Object.fromEntries(formDataToSend.entries()));
    console.log('Is edit mode:', isEdit);
    console.log('Form data _id:', formData._id);

    try {
      if (isEdit) {
        console.log('Updating LTC with ID:', formData._id);
        await updateLTC(formData._id, formDataToSend);
        toast.success('LTC request updated successfully');
      } else {
        await addLTC(formDataToSend);
        toast.success('LTC request added successfully');
      }
      closeModal();
      fetchLTCs();
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (_id: string) => {
    setLtcToDelete(_id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (ltcToDelete) {
      try {
        await deleteLTC(ltcToDelete);
        toast.success('LTC request deleted successfully');
        fetchLTCs();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred');
      } finally {
        setDeleteDialogOpen(false);
        setLtcToDelete(null);
      }
    }
  };



  const exportToExcel = () => {
    const exportData = ltcs.map(ltc => ({
      'Employee ID': ltc.employeeId.employeeId,
      'Employee Name': ltc.employeeId.name,
      'Department': ltc.department.departmentName,
      'Service Completion From': ltc.serviceCompletionFrom ? new Date(ltc.serviceCompletionFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Service Completion To': ltc.serviceCompletionTo ? new Date(ltc.serviceCompletionTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Leave Period From': ltc.leavePeriodFrom ? new Date(ltc.leavePeriodFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Leave Period To': ltc.leavePeriodTo ? new Date(ltc.leavePeriodTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Reimbursement Amount': ltc.reimbursementAmount,
      'Status': ltc.status,
      'Approved By': ltc.approvedBy || '',
      'Created At': ltc.createdAt ? new Date(ltc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LTC Requests');
    XLSX.writeFile(wb, 'ltc_requests.xlsx');
  };

  const filteredLTCs = ltcs.filter(ltc => {
    const status = ltc.status || 'pending';
    const paymentStatus = (ltc as any).paymentStatus || 'Not Paid';
    
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || paymentStatus === paymentStatusFilter;
    
    return matchesStatus && matchesPaymentStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }



  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leave Travel Concession (LTC)</h1>
          <p className="text-gray-600">Manage your LTC requests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add LTC Request
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>LTC Requests</CardTitle>
              <CardDescription>View and manage your LTC requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
                     <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                 <Label htmlFor="status-filter" className="text-sm font-medium">Search by Status:</Label>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="w-32">
                     <SelectValue placeholder="Status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Status</SelectItem>
                     <SelectItem value="pending">Pending</SelectItem>
                     <SelectItem value="approved">Approved</SelectItem>
                     <SelectItem value="rejected">Rejected</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="flex items-center space-x-2">
                 <Label htmlFor="payment-status-filter" className="text-sm font-medium">Search by Payment Status:</Label>
                 <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                   <SelectTrigger className="w-40">
                     <SelectValue placeholder="Payment Status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Payments</SelectItem>
                     <SelectItem value="Not Paid">Not Paid</SelectItem>
                     <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                     <SelectItem value="Fully Paid">Fully Paid</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Service Period</TableHead>
                  <TableHead>Leave Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[120px]">Admin Remarks</TableHead>
                  <TableHead className="w-[120px]">Acoounts Remarks</TableHead>
                  <TableHead className="w-[120px]">Payment Status</TableHead>
                  <TableHead className="w-[120px]">Attachment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLTCs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8">
                      <div className="text-gray-500 text-md">No LTC requests found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLTCs.map((ltc, index) => (
                    <TableRow key={ltc._id}>
                      <TableCell>
                        <div className="font-medium">{index + 1}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ltc.employeeId.employeeId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ltc.employeeId.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ltc.department.departmentName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ltc.serviceCompletionFrom && ltc.serviceCompletionTo
                            ? `${new Date(ltc.serviceCompletionFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(ltc.serviceCompletionTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                            : ltc.serviceCompletionFrom
                              ? new Date(ltc.serviceCompletionFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : ltc.serviceCompletionTo
                                ? new Date(ltc.serviceCompletionTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                : ''
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ltc.leavePeriodFrom && ltc.leavePeriodTo
                            ? `${new Date(ltc.leavePeriodFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(ltc.leavePeriodTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                            : ltc.leavePeriodFrom
                              ? new Date(ltc.leavePeriodFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : ltc.leavePeriodTo
                                ? new Date(ltc.leavePeriodTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                : ''
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{ltc.reimbursementAmount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-[120px] truncate">
                          {(ltc as any).adminRemarks || 'No remarks'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-[120px] truncate">
                          {(ltc as any).accountsRemarks || 'No remarks'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {(ltc as any).paymentStatus || 'Not Paid'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ltc.attachment ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`https://korus-ems-backend.vercel.app/api/ltc/attachment/${ltc._id}`, {
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                });
                                
                                if (response.ok) {
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  window.open(url, '_blank');
                                } else {
                                  toast.error('Failed to load attachment');
                                }
                              } catch (error) {
                                console.error('Error loading attachment:', error);
                                toast.error('Failed to load attachment');
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            View
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">No Attachment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(ltc.status)}>
                          {ltc.status.charAt(0).toUpperCase() + ltc.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFormData({
                                ...ltc,
                                departmentCode: ltc.department?.departmentId || '',
                                departmentName: ltc.department?.departmentName || ''
                              });
                              setIsEdit(true);
                              setShowModal(true);
                              setSelectedEmployee(ltc.employeeId);
                              setEmployeeSearchTerm('');
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(ltc._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center">
            <img src="/uploads/Korus.png" alt="Korus logo" className="h-16 w-16 mb-4" />
          </div>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit LTC Request' : 'Add New LTC Request'}
            </DialogTitle>
            <DialogDescription>
              Fill in the LTC request details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Input
                  value={selectedEmployee?.name || ''}
                  disabled
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  placeholder="Department"
                  value={selectedEmployee?.department?.departmentName || ''}
                  disabled
                  className="w-48"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceCompletionFrom">Service Completion From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.serviceCompletionFrom ? format(new Date(formData.serviceCompletionFrom), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={formData.serviceCompletionFrom ? new Date(formData.serviceCompletionFrom) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, serviceCompletionFrom: date ? date.toISOString() : '' }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceCompletionTo">Service Completion To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.serviceCompletionTo ? format(new Date(formData.serviceCompletionTo), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={formData.serviceCompletionTo ? new Date(formData.serviceCompletionTo) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, serviceCompletionTo: date ? date.toISOString() : '' }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leavePeriodFrom">Leave Period From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.leavePeriodFrom ? format(new Date(formData.leavePeriodFrom), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={formData.leavePeriodFrom ? new Date(formData.leavePeriodFrom) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, leavePeriodFrom: date ? date.toISOString() : '' }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leavePeriodTo">Leave Period To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.leavePeriodTo ? format(new Date(formData.leavePeriodTo), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={formData.leavePeriodTo ? new Date(formData.leavePeriodTo) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, leavePeriodTo: date ? date.toISOString() : '' }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reimbursementAmount">Reimbursement Amount (₹)</Label>
                <Input
                  id="reimbursementAmount"
                  name="reimbursementAmount"
                  type="number"
                  value={formData.reimbursementAmount}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment</Label>
              <Input
                id="attachment"
                name="attachment"
                type="file"
                accept=".pdf"
                onChange={(e) => setFormData(prev => ({ ...prev, attachment: e.target.files?.[0] || null }))}
              />
              <p className="text-sm text-gray-500">
                Note: Kindly upload only PDF files. Please scan all documents into a single PDF file before uploading.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? 'Update' : 'Add'} LTC Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this LTC request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setLtcToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeLTC; 