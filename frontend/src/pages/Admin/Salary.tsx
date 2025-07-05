import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Users, Building, Edit, Eye, X, Plus } from 'lucide-react';
import { getAllSalaries, Salary, addSalary, updateSalary, deleteSalary } from '@/utils/Salary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { getAllEmployees, Employee } from '@/utils/Employee';

const AdminSalary: React.FC = () => {
  const [salaryRecords, setSalaryRecords] = useState<Salary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    employeeId: '',
    employeeType: '',
    grossSalary: '',
    basicSalary: '',
    allowances: [
      { name: "HRA", amount: 0 },
      { name: "Food Allowance", amount: 0 },
      { name: "Medical Allowance", amount: 0 },
      { name: "Transport Allowance", amount: 0 },
    ],
    deductions: [
      { name: "EPF", amount: 0 },
      { name: "ESIC", amount: 0 },
      { name: "Advance Deduction", amount: 0 },
      { name: "Tax Deduction", amount: 0 },
    ],
    payableDays: '',
    sundays: '',
    netPayableDays: '',
    paymentMonth: '',
    paymentYear: '',
    department: '',
  });
  const [isEmployeeSelectOpen, setIsEmployeeSelectOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const slipRef = useRef<HTMLDivElement>(null);
  const [skipAutoCalc, setSkipAutoCalc] = useState(false);

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllSalaries();
        setSalaryRecords(data.salaries || []);
      } catch (err: any) {
        setError('Failed to fetch salaries');
      } finally {
        setLoading(false);
      }
    };
    fetchSalaries();
  }, []);

  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(() => { });
  }, []);

  useEffect(() => {
    if (skipAutoCalc) {
      setSkipAutoCalc(false);
      return;
    }
    const grossSalary = parseFloat(formData.grossSalary) || 0;
    const employeeType = formData.employeeType;
    if (grossSalary) {
      const basic = employeeType === 'Employee'
        ? (grossSalary * 0.45)
        : (grossSalary * 0.6);
      // Update basicSalary
      // Update allowances
      const updatedAllowances = [
        { name: 'HRA', amount: +(grossSalary * 0.27).toFixed(2) },
        { name: 'Food Allowance', amount: +(grossSalary * 0.1).toFixed(2) },
        { name: 'Medical Allowance', amount: +(grossSalary * 0.08).toFixed(2) },
        { name: 'Transport Allowance', amount: +(grossSalary * 0.1).toFixed(2) },
      ];
      // Update deductions
      const updatedDeductions = [
        { name: 'EPF', amount: +(basic * 0.12).toFixed(2) },
        {
          name: 'ESIC',
          amount: basic > 21000 ? 0 : +(grossSalary * 0.0075).toFixed(2),
        },
        { name: 'Advance Deduction', amount: 0 },
        { name: 'Tax Deduction', amount: 0 },
      ];
      setFormData(prev => ({
        ...prev,
        basicSalary: basic.toFixed(2),
        allowances: updatedAllowances,
        deductions: updatedDeductions,
      }));
    }
  }, [formData.grossSalary, formData.employeeType]);

  useEffect(() => {
    const paymentMonth = formData.paymentMonth;
    const paymentYear = formData.paymentYear;
    if (paymentMonth && paymentYear) {
      const monthIndex = new Date(`${paymentMonth} 1, ${paymentYear}`).getMonth();
      const daysInMonth = new Date(paymentYear, monthIndex + 1, 0).getDate();
      let sundaysCount = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(paymentYear, monthIndex, day);
        if (date.getDay() === 0) {
          sundaysCount++;
        }
      }
      setFormData(prev => ({ ...prev, sundays: sundaysCount }));
    }
  }, [formData.paymentMonth, formData.paymentYear]);

  useEffect(() => {
    const payableDays = parseInt(formData.payableDays || 0, 10);
    const sundays = parseInt(formData.sundays || 0, 10);
    const totalPayableDays = payableDays + sundays;
    setFormData(prev => ({ ...prev, netPayableDays: totalPayableDays }));
  }, [formData.payableDays, formData.sundays]);

  const filteredEmployees = employees
    .filter(e =>
      e.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      String(e.employeeId).includes(employeeSearchTerm)
    )
    .sort((a, b) => Number(a.employeeId) - Number(b.employeeId));

  // Get unique months and years from salary records
  const months = Array.from(new Set(salaryRecords.map(r => r.paymentMonth))).filter(Boolean);
  const years = Array.from(new Set(salaryRecords.map(r => r.paymentYear))).filter(Boolean);

  const filteredRecords = salaryRecords
    .filter(record => {
      const employeeName = record.employeeId && typeof record.employeeId === 'object' ? record.employeeId.name : '';
      const employeeIdStr = record.employeeId && typeof record.employeeId === 'object' ? String(record.employeeId.employeeId) : '';
      const departmentName = record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : '';
      const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employeeIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.employeeType && record.employeeType.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDepartment = departmentFilter === 'All' || departmentName === departmentFilter;
      const matchesMonth = monthFilter === 'All' || record.paymentMonth === monthFilter;
      const matchesYear = yearFilter === 'All' || record.paymentYear === yearFilter;
      return matchesSearch && matchesDepartment && matchesMonth && matchesYear;
    })
    .sort((a, b) => {
      const aId = a.employeeId && typeof a.employeeId === 'object' ? a.employeeId.employeeId : 0;
      const bId = b.employeeId && typeof b.employeeId === 'object' ? b.employeeId.employeeId : 0;
      return aId - bId;
    });

  // Calculate total salary for each record
  const getTotalSalary = (record: Salary) => {
    const totalAllowances = Array.isArray(record.allowances) ? record.allowances.reduce((sum, a) => sum + (a.amount || 0), 0) : 0;
    const totalDeductions = Array.isArray(record.deductions) ? record.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) : 0;
    return (record.basicSalary || 0) + totalAllowances - totalDeductions;
  };

  const stats = {
    totalEmployees: salaryRecords.length,
    totalPayroll: salaryRecords.reduce((sum, record) => sum + getTotalSalary(record), 0),
    avgSalary: salaryRecords.length > 0 ? salaryRecords.reduce((sum, record) => sum + getTotalSalary(record), 0) / salaryRecords.length : 0,
    departments: new Set(salaryRecords.map(record => (record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : ''))).size
  };

  const departments = Array.from(new Set(salaryRecords.map(record => (record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : '')))).filter(Boolean);

  const handleViewDetails = (salary: Salary) => {
    setSelectedSalary(salary);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSalary(null);
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      employeeId: '',
      employeeType: '',
      grossSalary: '',
      basicSalary: '',
      allowances: [
        { name: "HRA", amount: 0 },
        { name: "Food Allowance", amount: 0 },
        { name: "Medical Allowance", amount: 0 },
        { name: "Transport Allowance", amount: 0 },
      ],
      deductions: [
        { name: "EPF", amount: 0 },
        { name: "ESIC", amount: 0 },
        { name: "Advance Deduction", amount: 0 },
        { name: "Tax Deduction", amount: 0 },
      ],
      payableDays: '',
      sundays: '',
      netPayableDays: '',
      paymentMonth: '',
      paymentYear: '',
      department: '',
    });
    setSelectedEmployee(null);
    setShowFormModal(true);
  };

  const openEditModal = (record: any) => {
    setEditId(record._id);
    setFormData({
      employeeId: record.employeeId?._id || '',
      employeeType: record.employeeType || '',
      grossSalary: record.grossSalary || '',
      basicSalary: record.basicSalary || '',
      allowances: record.allowances || [],
      deductions: record.deductions || [],
      payableDays: record.payableDays || '',
      sundays: record.sundays || '',
      netPayableDays: record.netPayableDays || '',
      paymentMonth: record.paymentMonth || '',
      paymentYear: record.paymentYear || '',
      department: record.employeeId?.department?._id || '',
    });
    setSelectedEmployee(record.employeeId || null);
    setSkipAutoCalc(true);
    setShowFormModal(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData((prev: any) => ({
      ...prev,
      employeeId: employee._id,
      department: employee.department?._id || '',
    }));
    setIsEmployeeSelectOpen(false);
    setEmployeeSearchTerm('');
  };

  // Add handlers for dynamic fields
  const handleFieldChange = (index: number, type: 'allowances' | 'deductions', field: 'name' | 'amount', value: string) => {
    setFormData(prev => {
      const updated = [...prev[type]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [type]: updated };
    });
  };

  const addField = (type: 'allowances' | 'deductions') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: '', amount: '' }]
    }));
  };

  const removeField = (index: number, type: 'allowances' | 'deductions') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      allowances: formData.allowances.map(a => ({ ...a, amount: Number(a.amount) })),
      deductions: formData.deductions.map(d => ({ ...d, amount: Number(d.amount) })),
    };
    try {
      if (editId) {
        const response = await updateSalary(editId, dataToSend);
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await addSalary(dataToSend);
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message)
        }
      }
      setShowFormModal(false);
      setEditId(null);
      setFormData({
        employeeId: '',
        employeeType: '',
        grossSalary: '',
        basicSalary: '',
        allowances: [{ name: '', amount: '' }],
        deductions: [{ name: '', amount: '' }],
        payableDays: '',
        sundays: '',
        netPayableDays: '',
        paymentMonth: '',
        paymentYear: '',
        department: '',
      });
      // Refresh data
      const data = await getAllSalaries();
      setSalaryRecords(data.salaries || []);
    } catch (err: any) {
      toast.error('Failed to save salary');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSalary(deleteId);
      toast.success('Salary deleted');
      setShowDeleteDialog(false);
      setDeleteId(null);
      // Refresh data
      const data = await getAllSalaries();
      setSalaryRecords(data.salaries || []);
    } catch (err: any) {
      toast.error('Failed to delete salary');
    }
  };

  const handlePrintSlip = () => {
    if (slipRef.current) {
      // Hide everything except the slip for printing
      const printContents = slipRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // To restore event listeners
    }
  };

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 7 }, (_, i) => String(currentYear - 1 + i));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
          <p className="text-gray-600">Manage employee compensation and payroll</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Salary
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalPayroll.toLocaleString('en-IN'))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(stats.avgSalary).toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Records</CardTitle>
          <CardDescription>View and manage employee compensation details</CardDescription>
          <div className="flex flex-wrap items-center space-x-4 gap-y-2">
            <Input
              placeholder="Search employees by Id or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Months</SelectItem>
                {months.map(month => (
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
                {years.map(year => (
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Payable Days</TableHead>
                    <TableHead>Sundays</TableHead>
                    <TableHead>Net Payable Days</TableHead>
                    <TableHead>Payment Month</TableHead>
                    <TableHead>Payment Year</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const employeeName = record.employeeId && typeof record.employeeId === 'object' ? record.employeeId.name : '';
                    const department = record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : '';
                    const position = record.employeeType || '';
                    const grossSalary = record.grossSalary || 0;
                    const baseSalary = record.basicSalary || 0;
                    const allowances = Array.isArray(record.allowances) ? record.allowances.reduce((sum, a) => sum + (a.amount || 0), 0) : 0;
                    const deductions = Array.isArray(record.deductions) ? record.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) : 0;
                    const netSalary = (record.grossSalary || 0) - deductions;
                    return (
                      <TableRow key={record._id}>
                        <TableCell>{record.employeeId.employeeId}</TableCell>
                        <TableCell>{employeeName}</TableCell>
                        <TableCell>{department}</TableCell>
                        <TableCell>{position}</TableCell>
                        <TableCell>₹{grossSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{baseSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">+₹{allowances.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-red-600">-₹{deductions.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="font-medium">₹{netSalary.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{record.payableDays}</TableCell>
                        <TableCell>{record.sundays}</TableCell>
                        <TableCell>{record.netPayableDays}</TableCell>
                        <TableCell>{record.paymentMonth}</TableCell>
                        <TableCell>{record.paymentYear}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(record._id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* Modal for Allowances and Deductions */}
              {showModal && selectedSalary && (
                <Dialog open={showModal} onOpenChange={closeModal}>
                  <DialogContent className="max-w-2xl w-full p-0">
                    <div ref={slipRef} className="relative bg-white rounded-xl shadow-2xl border border-gray-300 print:bg-white print:shadow-none print:border print:rounded-none overflow-y-auto max-h-[80vh] max-w-[700px] w-full">
                      {/* Header */}
                      <div className="relative z-10 px-6 pt-8 pb-4 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex flex-row items-center md:items-start gap-4">
                            <img src="/uploads/Korus.png" alt="Company Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow border border-gray-200 bg-white mb-2" />
                            <div>
                              <h1 className="text-2xl md:text-2xl font-bold text-blue-900 tracking-wide leading-tight">Korus Engineering Solutions Pvt. Ltd.</h1>
                              <h4 className="text-gray-700 text-xs md:text-base leading-relaxed text-center md:text-left">
                                912, Pearls Best Heights-II, 9th Floor, Plot No. C-9, Netaji Subhash Place, Pitampura, Delhi - 110034
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center mt-4">
                        <span className="text-base md:text-lg font-semibold text-blue-700">Salary Slip</span>
                        <span className="text-gray-600 font-medium">{selectedSalary.paymentMonth} {selectedSalary.paymentYear}</span>
                      </div>
                      {/* Employee Info */}
                      <div className="relative z-10 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 bg-white">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-700">Employee ID: <span className="font-semibold text-blue-900">{selectedSalary.employeeId?.employeeId || '-'}</span></span>
                          <span className="font-medium text-gray-700">Name: <span className="font-semibold text-blue-900">{selectedSalary.employeeId?.name || '-'}</span></span>
                          <span className="font-medium text-gray-700">Designation: <span className="font-semibold text-blue-900">{selectedSalary.employeeId?.designation || '-'}</span></span>
                          <span className="font-medium text-gray-700">Department: <span className="font-semibold text-blue-900">{selectedSalary.employeeId?.department?.departmentName || '-'}</span></span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-700">Payable Days: <span className="font-semibold text-blue-900">{selectedSalary.payableDays}</span></span>
                          <span className="font-medium text-gray-700">Sundays: <span className="font-semibold text-blue-900">{selectedSalary.sundays}</span></span>
                          <span className="font-medium text-gray-700">Net Payable Days: <span className="font-semibold text-blue-900">{selectedSalary.netPayableDays}</span></span>
                        </div>
                      </div>
                      {/* Earnings & Deductions Table */}
                      <div className="relative z-10 px-6 py-2 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2 border-b border-blue-100 pb-1">Earnings</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                <tr>
                                  <td className="py-1 font-medium text-gray-700">Basic Salary</td>
                                  <td className="py-1 text-right font-semibold text-blue-900">₹{Number(selectedSalary.basicSalary).toLocaleString('en-IN')}</td>
                                </tr>
                                {selectedSalary.allowances?.map((a: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="py-1 font-medium text-gray-700">{a.name}</td>
                                    <td className="py-1 text-right font-semibold text-blue-900">₹{Number(a.amount).toLocaleString('en-IN')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-red-700 mb-2 border-b border-red-100 pb-1">Deductions</h3>
                            <table className="w-full text-sm">
                              <tbody>
                                {selectedSalary.deductions?.length ? selectedSalary.deductions.map((d: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="py-1 font-medium text-gray-700">{d.name}</td>
                                    <td className="py-1 text-right font-semibold text-red-600">-₹{Number(d.amount).toLocaleString('en-IN')}</td>
                                  </tr>
                                )) : <tr><td className="py-1 text-gray-400" colSpan={2}>No deductions</td></tr>}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 border-t pt-2">
                          <span className="text-lg font-bold text-gray-900">Net Salary</span>
                          <span className="text-2xl font-extrabold text-green-700">₹{(Number(selectedSalary.grossSalary) - (selectedSalary.deductions?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0)).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      {/* Footer */}
                      <div className="relative z-10 text-center p-2 border-t border-gray-200 text-gray-700 text-xs md:text-base leading-relaxed bg-gradient-to-r from-white to-blue-50 mt-2">
                        Korus Design & Skill Forum: Plot No. 32, Sector-4B, HSIIDC, Bahadurgarh, Haryana - 124507
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center mt-6 px-6 pb-6 gap-2 print:hidden">
                        <span className="italic text-gray-400 text-xs">*This is a computer generated slip and does not require signature</span>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={handlePrintSlip} className="mt-0">Print</Button>
                          <Button variant="outline" onClick={closeModal} className="mt-0">Close</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-[500px] h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Salary' : 'Add Salary'}</DialogTitle>
            <DialogDescription>{editId ? 'Edit salary details' : 'Add a new salary record'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setIsEmployeeSelectOpen(!isEmployeeSelectOpen)}
                  type="button"
                  disabled={!!editId}
                >
                  {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.employeeId})` : 'Select Employee'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {isEmployeeSelectOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2">
                      <Input
                        placeholder="Search employees..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {employee.employeeId} | {employee.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                name="department"
                value={selectedEmployee?.department?.departmentName || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <Label>Employee Type</Label>
                <Select
                  value={formData.employeeType}
                  onValueChange={val => setFormData((prev: any) => ({ ...prev, employeeType: val }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gross Salary</Label>
                <Input name="grossSalary" type="number" value={formData.grossSalary} onChange={handleFormChange} required onWheel={e => e.currentTarget.blur()} />
              </div>
              <div>
                <Label>Basic Salary</Label>
                <Input name="basicSalary" type="number" value={formData.basicSalary} onChange={handleFormChange} required onWheel={e => e.currentTarget.blur()} />
              </div>
              <div>
                <Label>Payable Days</Label>
                <Input name="payableDays" type="number" value={formData.payableDays} onChange={handleFormChange} required onWheel={e => e.currentTarget.blur()} />
              </div>
              <div>
                <Label>Sundays</Label>
                <Input name="sundays" type="number" value={formData.sundays} onChange={handleFormChange} required onWheel={e => e.currentTarget.blur()} />
              </div>
              <div>
                <Label>Net Payable Days</Label>
                <Input name="netPayableDays" type="number" value={formData.netPayableDays} onChange={handleFormChange} required onWheel={e => e.currentTarget.blur()} />
              </div>
              <div>
                <Label>Payment Month</Label>
                <Select
                  value={formData.paymentMonth}
                  onValueChange={val => setFormData((prev: any) => ({ ...prev, paymentMonth: val }))}
                  required
                >
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
                <Select
                  value={formData.paymentYear}
                  onValueChange={val => setFormData((prev: any) => ({ ...prev, paymentYear: val }))}
                  required
                >
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

              {/* Allowances Section */}
              <div>
                <Label>Allowances</Label>
                {formData.allowances.map((allowance, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <Input
                      placeholder="Allowance Name"
                      value={allowance.name}
                      onChange={e => handleFieldChange(idx, 'allowances', 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={allowance.amount}
                      onChange={e => handleFieldChange(idx, 'allowances', 'amount', e.target.value)}
                      onWheel={e => e.currentTarget.blur()}
                    />
                    <Button type="button" variant="destructive" onClick={() => removeField(idx, 'allowances')}>Delete</Button>
                  </div>
                ))}
                <Button type="button" onClick={() => addField('allowances')}>Add Allowance</Button>
              </div>
              {/* Deductions Section */}
              <div>
                <Label>Deductions</Label>
                {formData.deductions.map((deduction, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <Input
                      placeholder="Deduction Name"
                      value={deduction.name}
                      onChange={e => handleFieldChange(idx, 'deductions', 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={deduction.amount}
                      onChange={e => handleFieldChange(idx, 'deductions', 'amount', e.target.value)}
                      onWheel={e => e.currentTarget.blur()}
                    />
                    <Button type="button" variant="destructive" onClick={() => removeField(idx, 'deductions')}>Delete</Button>
                  </div>
                ))}
                <Button type="button" onClick={() => addField('deductions')}>Add Deduction</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button onClick={handleFormSubmit} type="button">{editId ? 'Update Salary' : 'Add Salary'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Salary</DialogTitle>
            <DialogDescription>Are you sure you want to delete this salary record? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSalary;
