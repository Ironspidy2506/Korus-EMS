import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, TrendingUp, Users, Building, Edit, Eye, X, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { getAllSalaries, Salary, addSalary, updateSalary, deleteSalary } from '@/utils/Salary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { getAllEmployees, Employee } from '@/utils/Employee';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

const AdminSalary: React.FC = () => {
  const [salaryRecords, setSalaryRecords] = useState<Salary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentMonthFilter, setPaymentMonthFilter] = useState('All');
  const [paymentYearFilter, setPaymentYearFilter] = useState('All');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
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
      setError(null);
      try {
        const data = await getAllSalaries();
        setSalaryRecords(data.salaries || []);
      } catch (err: any) {
        setError('Failed to fetch salaries');
      }
    };
    fetchSalaries();
  }, []);

  useEffect(() => {
    getAllEmployees().then((data) => {
      // Filter employees to only include those without a Date of Leaving (DOL)
      const activeEmployees = data.filter((emp: Employee) => !emp.dol);
      setEmployees(activeEmployees);
    }).catch(() => { });
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (skipAutoCalc) {
      setSkipAutoCalc(false);
      return;
    }
    const grossSalary = parseFloat(formData.grossSalary) || 0;
    const employeeType = formData.employeeType;
    if (grossSalary && employeeType) {
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





  const filteredEmployees = useMemo(() => {
    return employees
      .filter(e =>
        e.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        String(e.employeeId).includes(employeeSearchTerm)
      )
      .sort((a, b) => Number(a.employeeId) - Number(b.employeeId));
  }, [employees, employeeSearchTerm]);

  // Get unique months and years from salary records
  const availableMonths = useMemo(() => {
    return Array.from(new Set(salaryRecords.map(r => r.paymentMonth).filter(Boolean)))
      .sort((a, b) => {
        const monthsOrder = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthsOrder.indexOf(a) - monthsOrder.indexOf(b);
      });
  }, [salaryRecords]);

  const availableYears = useMemo(() => {
    return Array.from(new Set(salaryRecords.map(r => r.paymentYear).filter(Boolean)))
      .sort((a, b) => parseInt(b) - parseInt(a)); // Most recent year first
  }, [salaryRecords]);

  const filteredRecords = useMemo(() => {
    return salaryRecords
      .filter(record => {
        const employeeName = record.employeeId && typeof record.employeeId === 'object' ? record.employeeId.name : '';
        const employeeIdStr = record.employeeId && typeof record.employeeId === 'object' ? String(record.employeeId.employeeId) : '';
        const departmentName = record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : '';
        const matchesSearch = employeeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          employeeIdStr.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (record.employeeType && record.employeeType.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
        const matchesDepartment = departmentFilter === 'All' || departmentName === departmentFilter;
        const matchesPaymentMonth = paymentMonthFilter === 'All' || record.paymentMonth === paymentMonthFilter;
        const matchesPaymentYear = paymentYearFilter === 'All' || record.paymentYear === paymentYearFilter;

        return matchesSearch && matchesDepartment && matchesPaymentMonth && matchesPaymentYear;
      })
      .sort((a, b) => {
        const aId = a.employeeId && typeof a.employeeId === 'object' ? a.employeeId.employeeId : 0;
        const bId = b.employeeId && typeof b.employeeId === 'object' ? b.employeeId.employeeId : 0;
        return aId - bId;
      });
  }, [salaryRecords, debouncedSearchTerm, departmentFilter, paymentMonthFilter, paymentYearFilter]);

  // Calculate total salary for each record
  const getTotalSalary = (record: Salary) => {
    const totalAllowances = Array.isArray(record.allowances) ? record.allowances.reduce((sum, a) => sum + (a.amount || 0), 0) : 0;
    const totalDeductions = Array.isArray(record.deductions) ? record.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) : 0;
    return (record.basicSalary || 0) + totalAllowances - totalDeductions;
  };

  const stats = useMemo(() => {
    return {
      totalRecords: filteredRecords.length,
      totalPayroll: filteredRecords.reduce((sum, record) => sum + getTotalSalary(record), 0),
      avgSalary: filteredRecords.length > 0 ? filteredRecords.reduce((sum, record) => sum + getTotalSalary(record), 0) / filteredRecords.length : 0,
      departments: new Set(filteredRecords.map(record => (record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : ''))).size
    };
  }, [filteredRecords]);

  const departments = useMemo(() => {
    return Array.from(new Set(filteredRecords.map(record => (record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : '')))).filter(Boolean);
  }, [filteredRecords]);

  // Group records by employee for accordion view
  const groupedRecords = useMemo(() => {
    const grouped = filteredRecords.reduce((acc, record) => {
      const employeeId = record.employeeId && typeof record.employeeId === 'object' ? String(record.employeeId.employeeId) : 'Unknown';
      const employeeName = record.employeeId && typeof record.employeeId === 'object' ? record.employeeId.name : 'Unknown Employee';
      const department = record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : 'Unknown Department';
      
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employeeId,
          employeeName,
          department,
          records: []
        };
      }
      acc[employeeId].records.push(record);
      return acc;
    }, {} as Record<string, { employeeId: string; employeeName: string; department: string; records: Salary[] }>);

    // Sort records within each employee group by date (most recent first)
    Object.values(grouped).forEach(group => {
      group.records.sort((a, b) => {
        const aYear = parseInt(a.paymentYear || '0');
        const bYear = parseInt(b.paymentYear || '0');
        if (aYear !== bYear) return bYear - aYear;
        
        const monthsOrder = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const aMonthIndex = monthsOrder.indexOf(a.paymentMonth || '');
        const bMonthIndex = monthsOrder.indexOf(b.paymentMonth || '');
        return bMonthIndex - aMonthIndex;
      });
    });

    return grouped;
  }, [filteredRecords]);

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

  const toggleRow = (employeeId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
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
            <CardTitle className="text-sm font-medium">Total Salary Records</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
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

          <div className="flex items-center gap-2 mt-4 overflow-x-auto py-2">
            <Input
              placeholder="Search employees by Id or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-56 md:w-64 min-w-[10rem]"
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

            <Select value={paymentMonthFilter} onValueChange={setPaymentMonthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Payment Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Months</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentYearFilter} onValueChange={setPaymentYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Payment Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                const tableData = filteredRecords.map((record: any) => {
                  const employeeName = record.employeeId && typeof record.employeeId === 'object' ? record.employeeId.name : '';
                  const department = record.employeeId && typeof record.employeeId === 'object' && record.employeeId.department ? record.employeeId.department.departmentName : '';
                  const position = record.employeeType || '';
                  const grossSalary = record.grossSalary || 0;
                  const baseSalary = record.basicSalary || 0;
                  const allowances = Array.isArray(record.allowances) ? record.allowances.reduce((sum, a) => sum + (a.amount || 0), 0) : 0;
                  const deductions = Array.isArray(record.deductions) ? record.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) : 0;
                  const netSalary = (record.grossSalary || 0) - deductions;
                  return {
                    'Employee ID': record.employeeId.employeeId,
                    'Employee Name': employeeName,
                    'Department': department,
                    'Position': position,
                    'Gross Salary': grossSalary,
                    'Basic Salary': baseSalary,
                    'Allowances': allowances,
                    'Deductions': deductions,
                    'Net Salary': netSalary,
                    'Payable Days': record.payableDays,
                    'Sundays': record.sundays,
                    'Net Payable Days': record.netPayableDays,
                    'Payment Month': record.paymentMonth,
                    'Payment Year': record.paymentYear,
                  };
                });
                const worksheet = XLSX.utils.json_to_sheet(tableData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Salaries');
                XLSX.writeFile(workbook, 'Salaries.xlsx');
              }}
              variant="outline"
              className="border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center min-w-[10rem]"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No.</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Number of Records</TableHead>
                    <TableHead>Latest Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(groupedRecords).map((group, groupIndex) => (
                    <React.Fragment key={group.employeeId}>
                      {/* Main employee row */}
                      <TableRow 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRow(group.employeeId)}
                      >
                        <TableCell>
                          <div className="font-medium">{groupIndex + 1}</div>
                        </TableCell>
                        <TableCell>{group.employeeId}</TableCell>
                        <TableCell>{group.employeeName}</TableCell>
                        <TableCell>{group.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Badge variant="outline" className="text-sm bg-orange-50 text-orange-700 border-orange-200">
                              {group.records.length} record{group.records.length !== 1 ? 's' : ''}
                            </Badge>
                            {expandedRows.has(group.employeeId) ? (
                              <ChevronDown className="h-4 w-4 text-orange-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {group.records[0]?.paymentMonth} {group.records[0]?.paymentYear}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(group.records[0]);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(group.records[0]);
                              }}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expandable salary records */}
                      {expandedRows.has(group.employeeId) && (
                        <tr>
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-gray-50 p-4">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>S.No.</TableHead>
                                    <TableHead>Payment Period</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Gross Salary</TableHead>
                                    <TableHead>Basic Salary</TableHead>
                                    <TableHead>Allowances</TableHead>
                                    <TableHead>Deductions</TableHead>
                                    <TableHead>Net Salary</TableHead>
                                    <TableHead>Payable Days</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.records.map((record, recordIndex) => {
                                    const position = record.employeeType || '';
                                    const grossSalary = record.grossSalary || 0;
                                    const baseSalary = record.basicSalary || 0;
                                    const allowances = Array.isArray(record.allowances) ? record.allowances.reduce((sum, a) => sum + (a.amount || 0), 0) : 0;
                                    const deductions = Array.isArray(record.deductions) ? record.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) : 0;
                                    const netSalary = (record.grossSalary || 0) - deductions;
                                    return (
                                      <TableRow key={record._id}>
                                        <TableCell>
                                          <div className="font-medium">{recordIndex + 1}</div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex flex-col">
                                            <span className="font-medium">{record.paymentMonth}</span>
                                            <span className="text-sm text-gray-500">{record.paymentYear}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>{position}</TableCell>
                                        <TableCell>₹{grossSalary.toLocaleString()}</TableCell>
                                        <TableCell>₹{baseSalary.toLocaleString()}</TableCell>
                                        <TableCell className="text-green-600">+₹{allowances.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="text-red-600">-₹{deductions.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="font-medium">₹{netSalary.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>{record.payableDays}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center space-x-2">
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={() => handleViewDetails(record)}
                                              className="bg-blue-500 hover:bg-blue-600 text-white"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={() => openEditModal(record)}
                                              className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={() => openDeleteDialog(record._id)}
                                              className="bg-red-500 hover:bg-red-600 text-white"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
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
                        Plot No. 32, Sector-4B, HSIIDC, Bahadurgarh, Haryana - 124507
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
        <DialogContent className="sm:max-w-[700px] h-[80vh] overflow-y-auto">
          <div className="flex justify-center mb-4">
            <img src="/uploads/Korus.png" alt="Korus logo" className="h-16 w-auto" />
          </div>
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
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-72 overflow-auto">
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
