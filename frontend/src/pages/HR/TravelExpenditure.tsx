import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Train, Car, Users, Edit, Trash2, UserPlus, Search, XCircle, CheckCircle, Download, Plus, X } from 'lucide-react';
import { getAllTravelExpenditures, addTravelExpenditure, updateTravelExpenditure, deleteTravelExpenditure, TravelExpenditure, updateVoucherNo, approveOrRejectTravelExpenditure } from '@/utils/TravelExpenditure';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllEmployees } from '@/utils/Employee';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Employee } from '@/utils/Employee';
import { getAllDepartments, Department } from '@/utils/Department';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'secondary';
  }
};

const getTravelModeIcon = (mode: string) => {
  switch (mode) {
    case 'Air': return Plane;
    case 'Rail': return Train;
    case 'Other Mode': return Car;
    default: return Car;
  }
};

const initialForm = {
  _id: '',
  employeeId: '',
  empName: '',
  designation: '',
  department: '',
  placeOfVisit: '',
  clientName: '',
  projectNo: '',
  startDate: '',
  returnDate: '',
  purposeOfVisit: '',
  travelMode: '',
  ticketProvidedBy: '',
  deputationCharges: '',
  expenses: [],
  dayCharges: [],
  attachment: null,
};

const HRTravelExpenditure: React.FC = () => {
  const [travelExpenditures, setTravelExpenditures] = useState<TravelExpenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [voucherLoadingId, setVoucherLoadingId] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState<{ [key: string]: string }>({});
  const [voucherEditId, setVoucherEditId] = useState<string | null>(null);
  const [expenseInputs, setExpenseInputs] = useState([{ date: '', description: '', amount: '' }]);
  const [dayChargeInputs, setDayChargeInputs] = useState([{ date: '', description: '', amount: '' }]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [travelExpenditureToDelete, setTravelExpenditureToDelete] = useState<string | null>(null);
  const [claimedFromClient, setClaimedFromClient] = useState<boolean>(false);


  // Needed for input to work
  const handleVoucherChange = (id: string, value: string) => {
    setVoucherInput((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    fetchTravelExpenditures();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchTravelExpenditures = async () => {
    try {
      setLoading(true);
      const data = await getAllTravelExpenditures();
      setTravelExpenditures(data);
      setError(null);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch travel expenditures');
      setTravelExpenditures([]);
      setError(null);
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
      // Find the department details
      const department = departments.find(dept => dept._id === employee.department._id);
      setFormData(prev => ({
        ...prev,
        employeeId: employee._id,
        empName: employee.name,
        designation: employee.designation,
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
    setSelectedEmployee(null);
    setEmployeeSearchTerm('');

    setExpenseInputs([{ date: '', description: '', amount: '' }]);
    setDayChargeInputs([{ date: '', description: '', amount: '' }]);
    setClaimedFromClient(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialForm);
    setSelectedEmployee(null);
    setEmployeeError(null);
    setExpenseInputs([{ date: '', description: '', amount: '' }]);
    setDayChargeInputs([{ date: '', description: '', amount: '' }]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };





  const handleExpenseAdd = () => {
    setExpenseInputs(prev => [...prev, { date: '', description: '', amount: '' }]);
  };

  const handleExpenseRemove = (index: number) => {
    setExpenseInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpenseChange = (index: number, field: string, value: string) => {
    setExpenseInputs(prev => prev.map((expense, i) =>
      i === index ? { ...expense, [field]: value } : expense
    ));
  };

  const handleDayChargeAdd = () => {
    setDayChargeInputs(prev => [...prev, { date: '', description: '', amount: '' }]);
  };

  const handleDayChargeRemove = (index: number) => {
    setDayChargeInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleDayChargeChange = (index: number, field: string, value: string) => {
    setDayChargeInputs(prev => prev.map((charge, i) =>
      i === index ? { ...charge, [field]: value } : charge
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate expenses
    const validExpenses = expenseInputs
      .filter(expense => expense.date && expense.description && expense.amount)
      .map(expense => ({
        date: expense.date,
        description: expense.description,
        amount: parseFloat(expense.amount)
      }));

    // Validate day charges
    const validDayCharges = dayChargeInputs
      .filter(charge => charge.date && charge.description && charge.amount)
      .map(charge => ({
        date: charge.date,
        description: charge.description,
        amount: parseFloat(charge.amount)
      }));

    if (validExpenses.length === 0 && validDayCharges.length === 0) {
      toast.error('Please add at least one expense or day charge');
      return;
    }

    const formDataToSend = new FormData();

    // Always add expenses and dayCharges first
    formDataToSend.append('expenses', JSON.stringify(validExpenses));
    formDataToSend.append('dayCharges', JSON.stringify(validDayCharges));

    Object.keys(formData).forEach(key => {
      if (key === 'expenses' || key === 'dayCharges') {
        // Skip these as we already added them above
        return;
      } else if (key === 'attachment') {
        // Only send attachment if it's a new file (not existing data)
        if (formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        }
        // Skip existing attachment data to prevent validation errors
      } else if (key === 'department' && typeof formData[key] === 'object') {
        // Handle department object properly - use the department ID
        formDataToSend.append('department', formData[key]._id || '');
      } else if (key === 'employeeId' && selectedEmployee) {
        // Send the employee ID correctly
        formDataToSend.append('employeeId', selectedEmployee._id);
      } else if (key !== 'attachment') {
        formDataToSend.append(key, formData[key]);
      }
    });
    formDataToSend.append('claimedFromClient', String(claimedFromClient));

    // Debug logging
    console.log('Frontend - Valid expenses:', validExpenses);
    console.log('Frontend - Valid day charges:', validDayCharges);
    console.log('Frontend - Form data keys:', Object.keys(formData));

    // Log what's being sent
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`Frontend - Sending ${key}:`, value);
    }

    try {
      if (isEdit) {
        await updateTravelExpenditure(formData._id, formDataToSend);
        toast.success('Travel expenditure updated successfully');
      } else {
        await addTravelExpenditure(formDataToSend);
        toast.success('Travel expenditure added successfully');
      }
      closeModal();
      fetchTravelExpenditures();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (_id: string) => {
    setTravelExpenditureToDelete(_id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (travelExpenditureToDelete) {
      try {
        await deleteTravelExpenditure(travelExpenditureToDelete);
        toast.success('Travel expenditure deleted successfully');
        fetchTravelExpenditures();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred');
      } finally {
        setDeleteDialogOpen(false);
        setTravelExpenditureToDelete(null);
      }
    }
  };

  const handleApprove = async (travelExpenditureId: string) => {
    try {
      await approveOrRejectTravelExpenditure('approve', travelExpenditureId);
      toast.success('Travel expenditure approved successfully');
      fetchTravelExpenditures();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleReject = async (travelExpenditureId: string) => {
    const remarks = prompt('Please provide rejection remarks:');
    if (remarks !== null) {
      try {
        await approveOrRejectTravelExpenditure('reject', travelExpenditureId, remarks);
        toast.success('Travel expenditure rejected successfully');
        fetchTravelExpenditures();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  };

  const handleVoucherEditClick = (id: string, currentValue: string) => {
    setVoucherEditId(id);
    setVoucherInput(prev => ({ ...prev, [id]: currentValue }));
  };

  const handleVoucherSave = async (travelExpenditure: TravelExpenditure) => {
    try {
      setVoucherLoadingId(travelExpenditure._id!);
      await updateVoucherNo(travelExpenditure._id!, voucherInput[travelExpenditure._id!]);
      setVoucherEditId(null);
      toast.success('Voucher number updated successfully');
      fetchTravelExpenditures();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setVoucherLoadingId(null);
    }
  };

  const exportToExcel = () => {
    const exportData = travelExpenditures.map(te => {
      const expensesTotal = te.expenses ? te.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0;
      const dayChargesTotal = te.dayCharges ? te.dayCharges.reduce((sum, charge) => sum + charge.amount, 0) : 0;

      return {
        'Employee Name': te.employeeId.name,
        'Designation': te.employeeId.designation,
        'Department': te.department.departmentName,
        'Place of Visit': te.placeOfVisit,
        'Client Name': te.clientName,
        'Project No': te.projectNo,
        'Start Date': te.startDate,
        'Return Date': te.returnDate,
        'Purpose of Visit': te.purposeOfVisit,
        'Travel Mode': te.travelMode,
        'Ticket Provided By': te.ticketProvidedBy,
        'Deputation Charges': te.deputationCharges,
        'Expenses Total': expensesTotal,
        'Day Charges Total': dayChargesTotal,
        'Total Amount': te.totalAmount,
        'Claimed From Client': te.claimedFromClient ? 'Yes' : 'No',
        'Status': te.status,
        'Voucher No': te.voucherNo || '',
        'Created At': te.createdAt ? new Date(te.createdAt).toLocaleDateString() : '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Travel Expenditures');
    XLSX.writeFile(wb, 'travel_expenditures.xlsx');
  };

  const filteredTravelExpenditures = travelExpenditures.filter(te => {
    const searchTerm = tableSearchTerm.toLowerCase();
    const employeeIdStr = te.employeeId.employeeId.toString();
    const employeeName = te.employeeId.name.toLowerCase();
    const status = te.status || 'pending';

    // Filter by search term
    const matchesSearch = employeeIdStr.includes(tableSearchTerm) || employeeName.includes(searchTerm);

    // Filter by status
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No travel expenditures found</div>
          <div className="text-gray-400 text-sm">Try adding a new travel expenditure</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Travel Expenditure Management</h1>
          <p className="text-gray-600">Manage travel expenditure requests and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Travel Expenditure
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Travel Expenditures</CardTitle>
              <CardDescription>View and manage all travel expenditure requests</CardDescription>
            </div>

          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by Employee ID or Name..."
                  value={tableSearchTerm}
                  onChange={(e) => setTableSearchTerm(e.target.value)}
                  className="w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Search by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Place of Visit</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Project No</TableHead>
                  <TableHead>Travel Info</TableHead>
                  <TableHead>Amount (Expenses + Day Charges)</TableHead>
                  <TableHead>Client Claim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Voucher</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTravelExpenditures.map((te, index) => {
                  const TravelModeIcon = getTravelModeIcon(te.travelMode);
                  return (
                    <TableRow key={te._id}>
                      <TableCell>
                        <div className="font-medium">{index + 1}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{te.employeeId.employeeId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{te.employeeId.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-500">{te.department?.departmentName || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-500">{te.placeOfVisit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-500">{te.clientName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-500">{te.projectNo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TravelModeIcon className="h-4 w-4" />
                          <span>{te.travelMode}</span>
                        </div>
                        <div className="text-sm text-gray-500">{te.ticketProvidedBy}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{te.totalAmount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          <div>Expenses: ₹{te.expenses ? te.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString() : '0'}</div>
                          <div>Day Charges: ₹{te.dayCharges ? te.dayCharges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString() : '0'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={te.claimedFromClient ? 'secondary' : 'outline'}>
                          {te.claimedFromClient ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(te.status || 'pending')}>
                          {(te.status || 'pending').charAt(0).toUpperCase() + (te.status || 'pending').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {voucherEditId === te._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={voucherInput[te._id!] || ''}
                              onChange={(e) => handleVoucherChange(te._id!, e.target.value)}
                              className="w-24"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleVoucherSave(te)}
                              disabled={voucherLoadingId === te._id}
                            >
                              {voucherLoadingId === te._id ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setVoucherEditId(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{te.voucherNo || ''}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVoucherEditClick(te._id!, te.voucherNo || '')}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {te.attachment ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://korus-ems-backend.vercel.app/api/travel-expenditures/attachment/${te._id}`,
                                "_blank"
                              )
                            }
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
                        <div className="flex items-center gap-2">
                          {te.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(te._id!)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReject(te._id!)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFormData(te);
                              setIsEdit(true);
                              setShowModal(true);
                              // Set the selected employee correctly using the employee object
                              setSelectedEmployee(te.employeeId);
                              // Set department details from the populated data
                              if (te.department) {
                                setFormData(prev => ({
                                  ...prev,
                                  departmentCode: te.department.departmentId || '',
                                  departmentName: te.department.departmentName || ''
                                }));
                              }
                              setClaimedFromClient(!!te.claimedFromClient);
                              // Clear search terms when editing
                              setEmployeeSearchTerm('');
                              setExpenseInputs(te.expenses.map(exp => ({
                                date: exp.date ? exp.date.slice(0, 10) : '',
                                description: exp.description,
                                amount: exp.amount.toString()
                              })));
                              setDayChargeInputs((te.dayCharges || []).map(charge => ({
                                date: charge.date ? charge.date.slice(0, 10) : '',
                                description: charge.description,
                                amount: charge.amount.toString()
                              })));

                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(te._id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center">
            <img src="/uploads/Korus.png" alt="Korus logo" className="h-12 w-auto mb-4" />
          </div>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Travel Expenditure' : 'Add New Travel Expenditure'}
            </DialogTitle>
            <DialogDescription>
              Fill in the travel expenditure details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedEmployee?._id || ''}
                    onValueChange={(value) => handleEmployeeSelect(value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Search and select employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search by ID or name..."
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="mb-2"
                        />
                      </div>
                      {employees
                        .filter(emp =>
                          emp.employeeId.toString().includes(employeeSearchTerm) ||
                          emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                        )
                        .sort((a, b) => a.employeeId - b.employeeId)
                        .map((employee) => (
                          <SelectItem key={employee._id} value={employee._id}>
                            {employee.employeeId} - {employee.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                </div>
                {employeeError && <p className="text-red-500 text-sm">{employeeError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  placeholder="Department"
                  value={selectedEmployee ? `${formData.departmentCode} - ${formData.departmentName}` : ''}
                  disabled
                  className="w-48"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeOfVisit">Place of Visit</Label>
                <Input
                  id="placeOfVisit"
                  name="placeOfVisit"
                  value={formData.placeOfVisit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectNo">Project No</Label>
                <Input
                  id="projectNo"
                  name="projectNo"
                  value={formData.projectNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(new Date(formData.startDate), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date ? date.toISOString() : '' }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.returnDate ? format(new Date(formData.returnDate), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DateCalendar
                      mode="single"
                      selected={formData.returnDate ? new Date(formData.returnDate) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, returnDate: date ? date.toISOString() : '' }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelMode">Travel Mode</Label>
                <Select name="travelMode" value={formData.travelMode} onValueChange={(value) => setFormData(prev => ({ ...prev, travelMode: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Air">Air</SelectItem>
                    <SelectItem value="Rail">Rail</SelectItem>
                    <SelectItem value="Other Mode">Other Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticketProvidedBy">Ticket Provided By</Label>
                <Select name="ticketProvidedBy" value={formData.ticketProvidedBy} onValueChange={(value) => setFormData(prev => ({ ...prev, ticketProvidedBy: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="KORUS">KORUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deputationCharges">Deputation Charges</Label>
                <Select name="deputationCharges" value={formData.deputationCharges} onValueChange={(value) => setFormData(prev => ({ ...prev, deputationCharges: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="claimedFromClient" checked={claimedFromClient} onCheckedChange={(v) => setClaimedFromClient(Boolean(v))} />
                <Label htmlFor="claimedFromClient">Claimed from Client</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
              <Input
                id="purposeOfVisit"
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Expenses</Label>
              <div className="space-y-4">
                {expenseInputs.map((expense, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={expense.date}
                        onChange={(e) => handleExpenseChange(index, 'date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={expense.description}
                        onChange={(e) => handleExpenseChange(index, 'description', e.target.value)}
                        placeholder="Expense description"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      {expenseInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleExpenseRemove(index)}
                          className="h-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleExpenseAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Day Charges</Label>
              <div className="space-y-4">
                {dayChargeInputs.map((charge, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={charge.date}
                        onChange={(e) => handleDayChargeChange(index, 'date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={charge.description}
                        onChange={(e) => handleDayChargeChange(index, 'description', e.target.value)}
                        placeholder="Day charge description"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          value={charge.amount}
                          onChange={(e) => handleDayChargeChange(index, 'amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      {dayChargeInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDayChargeRemove(index)}
                          className="h-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleDayChargeAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Day Charge
                </Button>
              </div>
            </div>

            {/* Total Amount Display */}
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{(() => {
                      const expensesTotal = expenseInputs
                        .filter(exp => exp.amount)
                        .reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
                      const dayChargesTotal = dayChargeInputs
                        .filter(charge => charge.amount)
                        .reduce((sum, charge) => sum + parseFloat(charge.amount || '0'), 0);
                      return (expensesTotal + dayChargesTotal).toLocaleString();
                    })()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Expenses: ₹{expenseInputs
                    .filter(exp => exp.amount)
                    .reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0)
                    .toLocaleString()}</div>
                  <div>Day Charges: ₹{dayChargeInputs
                    .filter(charge => charge.amount)
                    .reduce((sum, charge) => sum + parseFloat(charge.amount || '0'), 0)
                    .toLocaleString()}</div>
                </div>
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
                {isEdit ? 'Update' : 'Add'} Travel Expenditure
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this travel expenditure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTravelExpenditureToDelete(null);
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

export default HRTravelExpenditure; 