import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Gift, TrendingUp, Users, Edit, Trash2, UserPlus, Search, XCircle, CheckCircle, Download } from 'lucide-react';
import { getAllAllowances, addAllowance, updateAllowance, deleteAllowance, Allowance, updateVoucherNo, approveOrRejectAllowance } from '@/utils/Allowance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllEmployees } from '@/utils/Employee';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '@/utils/Employee';
import { getAllDepartments, Department } from '@/utils/Department';
import { toast } from 'sonner';

const ALLOWANCE_TYPE_LABELS: Record<string, string> = {
  epfByCo: 'E.P.F By Co.',
  esiByCo: 'E.S.I By Co.',
  medPAIns: 'Med. & P.A. Ins.',
  monthlyInsAcc: 'Monthly Ins. & Accidental',
  gratuity: 'Gratuity',
  resPhone: 'Res. Phone',
  mobile: 'Mobile',
  carEmi: 'Car EMI',
  site: 'Site Allowance',
  earnedLeave: 'Earned Leave',
  ltc: 'LTC',
  petrol: 'Petrol',
  driver: 'Driver Allowance',
  carMaint: 'Car Maintenance',
  localTravel: 'Local Travel/Metro Fair',
  deferred: 'Deferred Allowance',
  overTime: 'Overtime',
  others: 'Other Allowances',
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'secondary';
  }
};

const monthsList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const yearsList = Array.from({ length: 10 }, (_, i) => String(currentYear - 5 + i));

const initialForm = {
  _id: '',
  employeeId: '',
  empName: '',
  designation: '',
  department: '',
  projectNo: '',
  client: '',
  allowanceMonth: '',
  allowanceYear: '',
  allowanceType: '',
  allowanceAmount: '',
  attachment: null,
};

const AdminAllowances: React.FC = () => {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
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
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [voucherLoadingId, setVoucherLoadingId] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState<{ [key: string]: string }>({});
  const [voucherEditId, setVoucherEditId] = useState<string | null>(null);

  // Needed for input to work
  const handleVoucherChange = (id: string, value: string) => {
    setVoucherInput((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    fetchAllowances();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchAllowances = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAllowances();
      setAllowances(data.allowances || []);
    } catch (err: any) {
      setError('Failed to fetch allowances');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      // Sort by employeeId (numeric)
      const sorted = data.sort((a, b) => Number(a.employeeId) - Number(b.employeeId));
      setEmployees(sorted);
    } catch (err) {
      setEmployeeError('Failed to fetch employees');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const totalAllowances = allowances.reduce((sum, a) => sum + (a.allowanceAmount || 0), 0);
  const uniqueEmployees = new Set(
    allowances.map(a => {
      if (a.employeeId && typeof a.employeeId === 'object' && 'employeeId' in a.employeeId) {
        return a.employeeId.employeeId;
      } else if (typeof a.employeeId === 'string' || typeof a.employeeId === 'number') {
        return a.employeeId;
      }
      return '';
    })
  ).size;
  const avgAllowance = allowances.length > 0 ? totalAllowances / allowances.length : 0;
  const uniqueBenefits = new Set(allowances.map(a => a.allowanceType)).size;

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData((prev: any) => ({
        ...prev,
        employeeId: employee._id,
        empName: employee.name,
        designation: employee.designation,
        department: employee.department?.departmentName || '',
      }));
      setIsOpen(false);
      setEmployeeError(null);
    }
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setShowModal(true);
    setSelectedEmployee(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialForm);
    setSelectedEmployee(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      let result;
      if (formData.attachment) {
        const fd = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          if (key === 'attachment' && value) {
            fd.append('attachment', value as File);
          } else if (value !== undefined && value !== null && typeof value !== 'object') {
            fd.append(key, String(value));
          }
        });
        result = await addAllowance(fd);
      } else {
        result = await addAllowance(submitData);
      }
      closeModal();
      fetchAllowances();
    } catch (err) {
      setError('Failed to submit allowance');
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      await deleteAllowance(_id);
      fetchAllowances();
    } catch (err) {
      setError('Failed to delete allowance');
    }
  };

  const handleApprove = async (allowanceId: string) => {
    try {
      const response = await approveOrRejectAllowance('approved', allowanceId);
      if (response.data.success) {
        toast.success('Allowance approved successfully');
        fetchAllowances(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to approve allowance');
      }
    } catch (error) {
      console.error("Error approving allowance:", error);
      toast.error('Failed to approve allowance');
    }
  };

  const handleReject = async (allowanceId: string) => {
    try {
      const response = await approveOrRejectAllowance('rejected', allowanceId);
      if (response.data.success) {
        toast.success('Allowance rejected successfully');
        fetchAllowances(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to reject allowance');
      }
    } catch (error) {
      console.error("Error rejecting allowance:", error);
      toast.error('Failed to reject allowance');
    }
  };

  // Filtered allowances for table
  const filteredAllowances = allowances.filter((a) => {
    let emp = a.employeeId && typeof a.employeeId === 'object' ? a.employeeId : null;
    const employeeId = emp && typeof emp.employeeId === 'number' ? emp.employeeId : '';
    const name = emp ? String(emp.name || '') : '';
    const departmentName = emp && emp.department ? String(emp.department.departmentName || '') : '';
    const searchLower = tableSearchTerm.toLowerCase();
    const matchesSearch = !tableSearchTerm.trim() ||
      String(employeeId).includes(tableSearchTerm) ||
      name.toLowerCase().includes(searchLower) ||
      departmentName.toLowerCase().includes(searchLower);

    // Month filter
    const matchesMonth = monthFilter === 'All' || a.allowanceMonth === monthFilter;

    // Year filter
    const matchesYear = yearFilter === 'All' || a.allowanceYear === yearFilter;

    return matchesSearch && matchesMonth && matchesYear;
  });

  // Inline voucher update handler (button version)
  const handleVoucherEditClick = (id: string, currentValue: string) => {
    setVoucherEditId(id);
    setVoucherInput((prev) => ({ ...prev, [id]: currentValue }));
  };

  const handleVoucherSave = async (allowance: Allowance) => {
    const value = voucherInput[allowance._id] ?? allowance.voucherNo ?? '';
    if (value === (allowance.voucherNo ?? '')) {
      setVoucherEditId(null);
      return;
    }
    setVoucherLoadingId(allowance._id);
    try {
      const response = await updateVoucherNo(allowance._id, value);
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllowances();
        setVoucherEditId(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      setError('Failed to update voucher no.');
    } finally {
      setVoucherLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Variable Allowances</h1>
          <p className="text-gray-600">Manage employee allowances and benefits</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={openAddModal}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Allowance
        </Button>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Allowance</DialogTitle>
              <DialogDescription>Add a new allowance for an employee</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className='col-span-2 md:col-span-1'>
                  <Label htmlFor="employee">Select Employee</Label>
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className={cn(
                          "w-full justify-between",
                          !selectedEmployee && "text-muted-foreground"
                        )}
                      >
                        {selectedEmployee
                          ? `${selectedEmployee.employeeId} - ${selectedEmployee.name}`
                          : "Search employee by ID or name..."
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search by employee ID or name..." />
                        <CommandList>
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            {employees.map((employee: Employee) => (
                              <CommandItem
                                key={employee._id}
                                value={`${employee.employeeId} ${employee.name} ${employee.department?.departmentName}`}
                                onSelect={() => handleEmployeeSelect(employee._id!)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedEmployee?._id === employee._id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{employee.employeeId} - {employee.name}</span>
                                  <span className="text-sm text-muted-foreground">{employee.department?.departmentName}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Employee Name</Label>
                  <Input type="text" name="empName" value={formData.empName} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input type="text" name="designation" value={formData.designation} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input type="text" name="department" value={formData.department} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Project No.</Label>
                  <Input type="text" name="projectNo" value={formData.projectNo} onChange={handleChange} placeholder="(If Any)" />
                </div>
                <div>
                  <Label>Client</Label>
                  <Input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="(If Any)" />
                </div>
                <div>
                  <Label>Month</Label>
                  <Select value={formData.allowanceMonth} onValueChange={val => setFormData((prev: any) => ({ ...prev, allowanceMonth: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthsList.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Year</Label>
                  <Select value={formData.allowanceYear} onValueChange={val => setFormData((prev: any) => ({ ...prev, allowanceYear: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsList.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Allowance Type</Label>
                  <Select value={formData.allowanceType} onValueChange={val => setFormData((prev: any) => ({ ...prev, allowanceType: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Allowance Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ALLOWANCE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    name="allowanceAmount"
                    value={formData.allowanceAmount}
                    onChange={handleChange}
                    onWheel={e => e.currentTarget.blur()}
                  />
                </div>
                <div>
                  <Label>Attachment (If Any)</Label>
                  <Input
                    type="file"
                    name="attachment"
                    onChange={e => setFormData((prev: any) => ({ ...prev, attachment: e.target.files?.[0] || null }))}
                    accept="*"
                  />
                  {formData.attachment && (
                    <div className="text-xs mt-1">Selected: {formData.attachment.name}</div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit Allowance</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allowances</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAllowances.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(avgAllowance).toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefits</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueBenefits}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variable Allowances Management</CardTitle>
          <CardDescription>All employee variable allowances</CardDescription>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Employee ID or Name"
                value={tableSearchTerm}
                onChange={e => setTableSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Months</SelectItem>
                {monthsList.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Years</SelectItem>
                {yearsList.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Allowance Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Voucher No.</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllowances.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell>{a.employeeId && typeof a.employeeId === 'object' ? a.employeeId.employeeId : ''}</TableCell>
                    <TableCell>{a.employeeId && typeof a.employeeId === 'object' ? a.employeeId.name : ''}</TableCell>
                    <TableCell>{ALLOWANCE_TYPE_LABELS[a.allowanceType] || a.allowanceType}</TableCell>
                    <TableCell>₹{a.allowanceAmount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{a.allowanceMonth}</TableCell>
                    <TableCell>{a.allowanceYear}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeColor(a.status || 'pending')}>
                        {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.voucherNo === '' ? (
                        <>
                          {voucherEditId === a._id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={voucherInput[a._id] !== undefined ? voucherInput[a._id] : (a.voucherNo || '')}
                                onChange={e => handleVoucherChange(a._id, e.target.value)}
                                className="max-w-[120px] h-8"
                                disabled={voucherLoadingId === a._id}
                              />
                              <Button
                                size="sm"
                                className="h-8 px-3"
                                disabled={voucherLoadingId === a._id}
                                onClick={() => handleVoucherSave(a)}
                              >
                                {voucherLoadingId === a._id ? (
                                  <span className="animate-spin h-4 w-4 text-gray-400"><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg></span>
                                ) : 'Save'}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant={a.voucherNo ? 'outline' : 'default'}
                              className="h-8 px-3"
                              onClick={() => handleVoucherEditClick(a._id, a.voucherNo || '')}
                            >
                              {a.voucherNo ? 'Edit' : 'Add'}
                            </Button>
                          )}
                        </>
                      ) : (
                        a.voucherNo || ''
                      )}
                    </TableCell>
                    <TableCell>
                      {a.attachment ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://korus-ems-backend.vercel.app/api/allowances/attachment/${a._id}`,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          View
                        </Button>
                      ) : (
                        <span className="text-gray-500">No Attachment</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {a.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(a._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject(a._id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAllowances;
