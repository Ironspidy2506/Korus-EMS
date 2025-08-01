import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Train, Car, Users, Edit, Trash2, UserPlus, Search, XCircle, CheckCircle, Download, Plus, X } from 'lucide-react';
import { getAllTravelExpenditures, addTravelExpenditure, updateTravelExpenditure, deleteTravelExpenditure, TravelExpenditure, updateVoucherNo, approveOrRejectTravelExpenditure } from '@/utils/TravelExpenditure';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllEmployees } from '@/utils/Employee';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { ChevronsUpDown, Check, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  accompaniedTeamMembers: [],
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
  const [isOpen, setIsOpen] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [voucherLoadingId, setVoucherLoadingId] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState<{ [key: string]: string }>({});
  const [voucherEditId, setVoucherEditId] = useState<string | null>(null);
  const [teamMemberInput, setTeamMemberInput] = useState('');
  const [expenseInputs, setExpenseInputs] = useState([{ date: '', description: '', amount: '' }]);

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
    } catch (error) {
      setError('Failed to fetch travel expenditures');
      console.error('Error:', error);
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
      setFormData(prev => ({
        ...prev,
        employeeId: employee._id,
        empName: employee.name,
        designation: employee.designation,
        department: employee.department
      }));
      setEmployeeError(null);
    }
    setIsOpen(false);
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setIsEdit(false);
    setShowModal(true);
    setSelectedEmployee(null);
    setExpenseInputs([{ date: '', description: '', amount: '' }]);
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

  const handleTeamMemberAdd = () => {
    if (teamMemberInput.trim()) {
      setFormData(prev => ({
        ...prev,
        accompaniedTeamMembers: [...prev.accompaniedTeamMembers, teamMemberInput.trim()]
      }));
      setTeamMemberInput('');
    }
  };

  const handleTeamMemberRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accompaniedTeamMembers: prev.accompaniedTeamMembers.filter((_, i) => i !== index)
    }));
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

    if (validExpenses.length === 0) {
      toast.error('Please add at least one expense');
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'accompaniedTeamMembers') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === 'expenses') {
        formDataToSend.append(key, JSON.stringify(validExpenses));
      } else if (key === 'attachment' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== 'attachment') {
        formDataToSend.append(key, formData[key]);
      }
    });

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
    if (window.confirm('Are you sure you want to delete this travel expenditure?')) {
      try {
        await deleteTravelExpenditure(_id);
        toast.success('Travel expenditure deleted successfully');
        fetchTravelExpenditures();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred');
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
    const exportData = travelExpenditures.map(te => ({
      'Employee Name': te.employeeId.name,
      'Designation': te.designation,
      'Department': te.department,
      'Place of Visit': te.placeOfVisit,
      'Client Name': te.clientName,
      'Project No': te.projectNo,
      'Start Date': te.startDate,
      'Return Date': te.returnDate,
      'Purpose of Visit': te.purposeOfVisit,
      'Travel Mode': te.travelMode,
      'Ticket Provided By': te.ticketProvidedBy,
      'Deputation Charges': te.deputationCharges,
      'Total Amount': te.totalAmount,
      'Status': te.status,
      'Voucher No': te.voucherNo || '',
      'Created At': te.createdAt ? new Date(te.createdAt).toLocaleDateString() : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Travel Expenditures');
    XLSX.writeFile(wb, 'travel_expenditures.xlsx');
  };

  const filteredTravelExpenditures = travelExpenditures.filter(te =>
    te.employeeId.name.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
    te.placeOfVisit.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
    te.clientName.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
    te.projectNo.toLowerCase().includes(tableSearchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Travel Expenditure Management</h1>
          <p className="text-gray-600">Manage travel expenditure requests and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search travel expenditures..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Visit Details</TableHead>
                <TableHead>Travel Info</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Voucher</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTravelExpenditures.map((te) => {
                const TravelModeIcon = getTravelModeIcon(te.travelMode);
                return (
                  <TableRow key={te._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{te.employeeId.name}</div>
                        <div className="text-sm text-gray-500">{te.designation}</div>
                        <div className="text-sm text-gray-500">{te.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{te.placeOfVisit}</div>
                        <div className="text-sm text-gray-500">{te.clientName}</div>
                        <div className="text-sm text-gray-500">Project: {te.projectNo}</div>
                      </div>
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
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeColor(te.status || 'pending')}>
                        {te.status || 'pending'}
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
                          <span className="text-sm">{te.voucherNo || 'Not set'}</span>
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
                      <div className="flex items-center gap-2">
                        {te.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(te._id!)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReject(te._id!)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-3 w-3" />
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
                            setSelectedEmployee(te.employeeId);
                            setExpenseInputs(te.expenses.map(exp => ({
                              date: exp.date,
                              description: exp.description,
                              amount: exp.amount.toString()
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
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isOpen}
                      className="w-full justify-between"
                    >
                      {selectedEmployee ? selectedEmployee.name : "Select employee..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search employee..." />
                      <CommandList>
                        <CommandEmpty>No employee found.</CommandEmpty>
                        <CommandGroup>
                          {employees.map((employee) => (
                            <CommandItem
                              key={employee._id}
                              value={employee.name}
                              onSelect={() => handleEmployeeSelect(employee._id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedEmployee?._id === employee._id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {employee.name} - {employee.designation}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {employeeError && <p className="text-red-500 text-sm">{employeeError}</p>}
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
              <Label>Accompanied Team Members</Label>
              <div className="flex gap-2">
                <Input
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
                  placeholder="Enter team member name"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTeamMemberAdd())}
                />
                <Button type="button" onClick={handleTeamMemberAdd}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.accompaniedTeamMembers.map((member, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {member}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleTeamMemberRemove(index)} />
                  </Badge>
                ))}
              </div>
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
                    <div className="flex gap-2">
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
              <Label htmlFor="attachment">Attachment</Label>
              <Input
                id="attachment"
                name="attachment"
                type="file"
                onChange={(e) => setFormData(prev => ({ ...prev, attachment: e.target.files?.[0] || null }))}
              />
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
    </div>
  );
};

export default HRTravelExpenditure; 