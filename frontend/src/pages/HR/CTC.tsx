import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, PieChart, BarChart3, Search, Download, Eye, Printer } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getAllSalaries, updateSalary } from '@/utils/Salary';
import { getAllAllowances } from '@/utils/Allowance';
import { getAllFixedAllowances } from '@/utils/FixedAllowance';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X } from 'lucide-react';

interface CTCData {
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  year: string;
  grossSalary: number;
  basicSalary: number;
  salaryAllowances: number;
  salaryDeductions: number;
  variableAllowances: number;
  fixedAllowances: number;
  totalCTC: number;
  salaryId?: string; // Store salary record ID for editing
  employeeIdObj?: string; // Store employee ObjectId for updating
  employeeType?: string; // Store employee type for updating
  payableDays?: number; // Store payable days for updating
  detailedSalaryAllowances?: Array<{ name: string; amount: number }>;
  detailedSalaryDeductions?: Array<{ name: string; amount: number }>;
}

const HRCTC: React.FC = () => {
  const [ctcData, setCtcData] = useState<CTCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [viewSlip, setViewSlip] = useState<CTCData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<CTCData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 10 }, (_, i) => String(currentYear - 5 + i));

  useEffect(() => {
    fetchCTCData();
  }, []);

  const fetchCTCData = async () => {
    try {
      setLoading(true);

      // Fetch all data with individual error handling
      let salariesResponse, allowancesResponse, fixedAllowancesResponse;

      try {
        salariesResponse = await getAllSalaries();
      } catch (error) {
        console.error('Error fetching salaries:', error);
        toast.error('Failed to fetch salary data');
        return;
      }

      try {
        allowancesResponse = await getAllAllowances();
      } catch (error) {
        console.error('Error fetching allowances:', error);
        toast.error('Failed to fetch allowance data');
        return;
      }

      try {
        fixedAllowancesResponse = await getAllFixedAllowances();
      } catch (error) {
        console.error('Error fetching fixed allowances:', error);
        toast.error('Failed to fetch fixed allowance data');
        return;
      }

      // Extract data from responses - handle both direct arrays and success objects
      let salaries = [];
      let allowances = [];
      let fixedAllowances = [];

      // Handle salaries
      if (Array.isArray(salariesResponse)) {
        salaries = salariesResponse;
      } else if (salariesResponse && salariesResponse.salaries) {
        salaries = salariesResponse.salaries;
      } else if (salariesResponse && salariesResponse.success && salariesResponse.salaries) {
        salaries = salariesResponse.salaries;
      }

      // Handle allowances
      if (Array.isArray(allowancesResponse)) {
        allowances = allowancesResponse;
      } else if (allowancesResponse && allowancesResponse.allowances) {
        allowances = allowancesResponse.allowances;
      } else if (allowancesResponse && allowancesResponse.success && allowancesResponse.allowances) {
        allowances = allowancesResponse.allowances;
      }

      // Handle fixed allowances
      if (Array.isArray(fixedAllowancesResponse)) {
        fixedAllowances = fixedAllowancesResponse;
      } else if (fixedAllowancesResponse && fixedAllowancesResponse.allowances) {
        fixedAllowances = fixedAllowancesResponse.allowances;
      } else if (fixedAllowancesResponse && fixedAllowancesResponse.success && fixedAllowancesResponse.allowances) {
        fixedAllowances = fixedAllowancesResponse.allowances;
      }

      // Create a map to merge data by employee, month, and year
      const ctcMap = new Map<string, CTCData>();

      // Process salaries
      salaries.forEach((salary: any) => {
        // Filter out employees with DOL (Date of Leaving)
        if (salary.employeeId?.dol) {
          return;
        }
        const key = `${salary.employeeId?.employeeId || salary.employeeId}_${salary.paymentMonth}_${salary.paymentYear}`;
        const employeeName = salary.employeeId?.name || 'Unknown';
        const department = salary.employeeId?.department?.departmentName || 'Unknown';

        // Calculate salary allowances and deductions
        const salaryAllowances = Array.isArray(salary.allowances)
          ? salary.allowances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0)
          : 0;
        const salaryDeductions = Array.isArray(salary.deductions)
          ? salary.deductions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
          : 0;

        // Get detailed allowances and deductions
        const detailedSalaryAllowances: Array<{ name: string; amount: number }> = Array.isArray(salary.allowances)
          ? salary.allowances.map((a: any) => ({ name: a.name || 'Allowance', amount: a.amount || 0 }))
          : [];
        const detailedSalaryDeductions: Array<{ name: string; amount: number }> = Array.isArray(salary.deductions)
          ? salary.deductions.map((d: any) => ({ name: d.name || 'Deduction', amount: d.amount || 0 }))
          : [];

        if (!ctcMap.has(key)) {
          ctcMap.set(key, {
            employeeId: salary.employeeId?.employeeId || salary.employeeId,
            employeeName,
            department,
            month: salary.paymentMonth,
            year: salary.paymentYear,
            grossSalary: salary.grossSalary || 0,
            basicSalary: salary.basicSalary || 0,
            salaryAllowances,
            salaryDeductions,
            variableAllowances: 0,
            fixedAllowances: 0,
            totalCTC: (salary.basicSalary || 0) + salaryAllowances - salaryDeductions,
            salaryId: salary._id,
            employeeIdObj: typeof salary.employeeId === 'object' ? salary.employeeId._id : salary.employeeId,
            employeeType: salary.employeeType || '',
            payableDays: salary.payableDays || 0,
            detailedSalaryAllowances,
            detailedSalaryDeductions
          });
        } else {
          const existing = ctcMap.get(key)!;
          existing.grossSalary = salary.grossSalary || 0;
          existing.basicSalary = salary.basicSalary || 0;
          existing.salaryAllowances = salaryAllowances;
          existing.salaryDeductions = salaryDeductions;
          existing.totalCTC = (salary.basicSalary || 0) + salaryAllowances - salaryDeductions + existing.variableAllowances + existing.fixedAllowances;
          existing.salaryId = salary._id;
          existing.employeeIdObj = typeof salary.employeeId === 'object' ? salary.employeeId._id : salary.employeeId;
          existing.employeeType = salary.employeeType || '';
          existing.payableDays = salary.payableDays || 0;
          existing.detailedSalaryAllowances = detailedSalaryAllowances;
          existing.detailedSalaryDeductions = detailedSalaryDeductions;
        }
      });

      // Process allowances - only include approved ones
      allowances.forEach((allowance: any) => {
        // Only process approved allowances
        if (allowance.status !== 'approved') {
          return;
        }
        // Filter out employees with DOL (Date of Leaving)
        if (allowance.employeeId?.dol) {
          return;
        }

        const key = `${allowance.employeeId?.employeeId || allowance.employeeId}_${allowance.allowanceMonth}_${allowance.allowanceYear}`;
        const employeeName = allowance.employeeId?.name || 'Unknown';
        const department = allowance.employeeId?.department?.departmentName || 'Unknown';

        if (!ctcMap.has(key)) {
          ctcMap.set(key, {
            employeeId: allowance.employeeId?.employeeId || allowance.employeeId,
            employeeName,
            department,
            month: allowance.allowanceMonth,
            year: allowance.allowanceYear,
            grossSalary: 0,
            basicSalary: 0,
            salaryAllowances: 0,
            salaryDeductions: 0,
            variableAllowances: allowance.allowanceAmount || 0,
            fixedAllowances: 0,
            totalCTC: allowance.allowanceAmount || 0
          });
        } else {
          const existing = ctcMap.get(key)!;
          existing.variableAllowances += allowance.allowanceAmount || 0;
          existing.totalCTC += allowance.allowanceAmount || 0;
        }
      });

      // Process fixed allowances - only include approved ones
      fixedAllowances.forEach((fixedAllowance: any) => {
        // Only process approved fixed allowances
        if (fixedAllowance.status !== 'approved') {
          return;
        }
        // Filter out employees with DOL (Date of Leaving)
        if (fixedAllowance.employeeId?.dol) {
          return;
        }

        const key = `${fixedAllowance.employeeId?.employeeId || fixedAllowance.employeeId}_${fixedAllowance.allowanceMonth}_${fixedAllowance.allowanceYear}`;
        const employeeName = fixedAllowance.employeeId?.name || 'Unknown';
        const department = fixedAllowance.employeeId?.department?.departmentName || 'Unknown';

        if (!ctcMap.has(key)) {
          ctcMap.set(key, {
            employeeId: fixedAllowance.employeeId?.employeeId || fixedAllowance.employeeId,
            employeeName,
            department,
            month: fixedAllowance.allowanceMonth,
            year: fixedAllowance.allowanceYear,
            grossSalary: 0,
            basicSalary: 0,
            salaryAllowances: 0,
            salaryDeductions: 0,
            variableAllowances: 0,
            fixedAllowances: fixedAllowance.allowanceAmount || 0,
            totalCTC: fixedAllowance.allowanceAmount || 0
          });
        } else {
          const existing = ctcMap.get(key)!;
          existing.fixedAllowances += fixedAllowance.allowanceAmount || 0;
          existing.totalCTC += fixedAllowance.allowanceAmount || 0;
        }
      });

      // Convert map to array and sort
      const mergedData = Array.from(ctcMap.values()).sort((a, b) => {
        // Sort by year, then month, then employee name
        if (a.year !== b.year) return b.year.localeCompare(a.year);
        if (a.month !== b.month) return monthsList.indexOf(b.month) - monthsList.indexOf(a.month);
        return a.employeeName.localeCompare(b.employeeName);
      });

      console.log('CTC Debug:', {
        salaryRecordsCount: salaries.length,
        allowanceRecordsCount: allowances.length,
        fixedAllowanceRecordsCount: fixedAllowances.length,
        mergedRecordsCount: mergedData.length,
        approvedAllowancesCount: allowances.filter((a: any) => a.status === 'approved').length,
        approvedFixedAllowancesCount: fixedAllowances.filter((fa: any) => fa.status === 'approved').length,
        totalSalaryFromMerged: mergedData.reduce((sum, item) => sum + item.basicSalary + item.salaryAllowances - item.salaryDeductions, 0),
        totalVariableAllowancesFromMerged: mergedData.reduce((sum, item) => sum + item.variableAllowances, 0),
        totalFixedAllowancesFromMerged: mergedData.reduce((sum, item) => sum + item.fixedAllowances, 0),
        totalCTCFromMerged: mergedData.reduce((sum, item) => sum + item.totalCTC, 0)
      });

      setCtcData(mergedData);
      toast.success('CTC data loaded successfully');
    } catch (error) {
      console.error('Error fetching CTC data:', error);
      toast.error('Failed to fetch CTC data');
    } finally {
      setLoading(false);
    }
  };

  // Filtered CTC data
  const filteredCTCData = ctcData.filter((item) => {
    const matchesSearch = !searchTerm.trim() ||
      item.employeeId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMonth = monthFilter === 'All' || item.month === monthFilter;
    const matchesYear = yearFilter === 'All' || item.year === yearFilter;

    return matchesSearch && matchesMonth && matchesYear;
  });

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset to original data
      setEditedData(null);
      setIsEditMode(false);
    } else {
      // Enter edit mode - create editable copy
      if (viewSlip) {
        setEditedData({
          ...viewSlip,
          detailedSalaryAllowances: viewSlip.detailedSalaryAllowances || [],
          detailedSalaryDeductions: viewSlip.detailedSalaryDeductions || []
        });
        setIsEditMode(true);
      }
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editedData || !editedData.salaryId || !editedData.employeeIdObj) {
      toast.error('Cannot save: Missing salary record information');
      return;
    }

    setIsSaving(true);
    try {
      // Calculate total allowances and deductions from detailed arrays
      const totalAllowances = (editedData.detailedSalaryAllowances || []).reduce((sum, a) => sum + a.amount, 0);
      const totalDeductions = (editedData.detailedSalaryDeductions || []).reduce((sum, d) => sum + d.amount, 0);

      // Prepare salary update data
      const salaryUpdateData = {
        employeeId: editedData.employeeIdObj,
        employeeType: editedData.employeeType || '',
        grossSalary: editedData.grossSalary,
        basicSalary: editedData.basicSalary,
        payableDays: editedData.payableDays || 0,
        allowances: editedData.detailedSalaryAllowances || [],
        deductions: editedData.detailedSalaryDeductions || [],
        paymentMonth: editedData.month,
        paymentYear: editedData.year
      };

      const response = await updateSalary(editedData.salaryId, salaryUpdateData as any);
      
      if (response.data.success) {
        toast.success('CTC updated successfully');
        setIsEditMode(false);
        setEditedData(null);
        // Refresh CTC data
        await fetchCTCData();
        // Update viewSlip with new data
        const updatedData = {
          ...editedData,
          salaryAllowances: totalAllowances,
          salaryDeductions: totalDeductions,
          totalCTC: editedData.basicSalary + totalAllowances - totalDeductions + editedData.variableAllowances + editedData.fixedAllowances
        };
        setViewSlip(updatedData);
      } else {
        toast.error(response.data.message || 'Failed to update CTC');
      }
    } catch (error: any) {
      console.error('Error saving CTC:', error);
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle field changes in edit mode
  const handleFieldChange = (field: keyof CTCData, value: any) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  // Handle allowance/deduction item changes
  const handleAllowanceChange = (index: number, field: 'name' | 'amount', value: string | number) => {
    if (!editedData || !editedData.detailedSalaryAllowances) return;
    const updated = [...editedData.detailedSalaryAllowances];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData({ ...editedData, detailedSalaryAllowances: updated });
  };

  const handleDeductionChange = (index: number, field: 'name' | 'amount', value: string | number) => {
    if (!editedData || !editedData.detailedSalaryDeductions) return;
    const updated = [...editedData.detailedSalaryDeductions];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData({ ...editedData, detailedSalaryDeductions: updated });
  };

  // Add/remove allowance/deduction items
  const handleAddAllowance = () => {
    if (!editedData) return;
    const updated = [...(editedData.detailedSalaryAllowances || []), { name: '', amount: 0 }];
    setEditedData({ ...editedData, detailedSalaryAllowances: updated });
  };

  const handleRemoveAllowance = (index: number) => {
    if (!editedData || !editedData.detailedSalaryAllowances) return;
    const updated = editedData.detailedSalaryAllowances.filter((_, i) => i !== index);
    setEditedData({ ...editedData, detailedSalaryAllowances: updated });
  };

  const handleAddDeduction = () => {
    if (!editedData) return;
    const updated = [...(editedData.detailedSalaryDeductions || []), { name: '', amount: 0 }];
    setEditedData({ ...editedData, detailedSalaryDeductions: updated });
  };

  const handleRemoveDeduction = (index: number) => {
    if (!editedData || !editedData.detailedSalaryDeductions) return;
    const updated = editedData.detailedSalaryDeductions.filter((_, i) => i !== index);
    setEditedData({ ...editedData, detailedSalaryDeductions: updated });
  };

  // Calculate stats
  const totalCTC = ctcData.reduce((sum, item) => sum + item.totalCTC, 0);
  const totalSalary = ctcData.reduce((sum, item) => sum + item.basicSalary + item.salaryAllowances - item.salaryDeductions, 0);
  const totalVariableAllowances = ctcData.reduce((sum, item) => sum + item.variableAllowances, 0);
  const totalFixedAllowances = ctcData.reduce((sum, item) => sum + item.fixedAllowances, 0);
  const avgCTC = ctcData.length > 0 ? totalCTC / ctcData.length : 0;
  const uniqueEmployees = new Set(ctcData.map(item => item.employeeId)).size;
  const totalRecords = ctcData.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CTC Management</h1>
          <p className="text-gray-600">Manage Cost to Company calculations and structures</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CTC</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCTC.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTC</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(avgCTC).toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueEmployees}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CTC Management</CardTitle>
          <CardDescription>Merged salary, allowances, and fixed allowances data</CardDescription>
          <div className="flex items-center gap-2 mt-6 pt-4 overflow-x-auto pb-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Employee ID, Name, or Department"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-56 md:w-64 min-w-[10rem]"
            />
            <Select onValueChange={(value) => setMonthFilter(value)} value={monthFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Months</SelectItem>
                {monthsList.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setYearFilter(value)} value={yearFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Years</SelectItem>
                {yearsList.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const tableData = filteredCTCData.map((item) => ({
                  'Employee ID': item.employeeId,
                  'Employee Name': item.employeeName,
                  'Department': item.department,
                  'Month': item.month,
                  'Year': item.year,
                  'Gross Salary': item.grossSalary,
                  'Basic Salary': item.basicSalary,
                  'Salary Allowances': item.salaryAllowances,
                  'Salary Deductions': item.salaryDeductions,
                  'Variable Allowances': item.variableAllowances,
                  'Fixed Allowances': item.fixedAllowances,
                  'Total CTC': item.totalCTC,
                }));
                const worksheet = XLSX.utils.json_to_sheet(tableData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'CTC');
                XLSX.writeFile(workbook, 'CTC.xlsx');
              }}
              variant="outline"
              className="border border-gray-300 text-gray-700 hover:bg-gray-100 ml-2 flex items-center min-w-[10rem]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Loading CTC data...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Salary Allowances</TableHead>
                  <TableHead>Salary Deductions</TableHead>
                  <TableHead>Variable Allowances</TableHead>
                <TableHead>Fixed Allowances</TableHead>
                <TableHead>Total CTC</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCTCData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchTerm || monthFilter !== 'All' || yearFilter !== 'All'
                          ? 'No CTC records match your search criteria.'
                          : 'No CTC records found.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCTCData.map((item, index) => (
                    <TableRow key={`${item.employeeId}_${item.month}_${item.year}_${index}`}>
                      <TableCell><div className="font-medium">{index + 1}</div></TableCell>
                      <TableCell className="font-medium">{item.employeeId}</TableCell>
                      <TableCell>{item.employeeName}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{item.month}</TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>₹{item.grossSalary.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{item.basicSalary.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-green-600">+₹{item.salaryAllowances.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-red-600">-₹{item.salaryDeductions.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{item.variableAllowances.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{item.fixedAllowances.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="font-bold">₹{item.totalCTC.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewSlip(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CTC Slip Modal */}
      {viewSlip && (
        <Dialog open={!!viewSlip} onOpenChange={() => {
          setViewSlip(null);
          setIsEditMode(false);
          setEditedData(null);
        }}>
          <DialogContent className="max-w-[160vw] w-[160vw] p-0 mx-1 sm:mx-0 sm:max-w-2xl sm:w-auto rounded-lg">
            <div ref={slipRef} className="relative bg-white rounded-xl shadow-2xl border border-gray-300 print:bg-white print:shadow-none print:border print:rounded-none overflow-y-auto max-h-[90vh] w-full">
              {/* Edit Mode Toggle Button */}
              <div className="absolute top-4 right-4 print:hidden z-20">
                {!isEditMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={!viewSlip.salaryId}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditToggle}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
              {/* Header */}
              <div className="relative z-10 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex flex-col items-center sm:items-start gap-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                    <img src="/uploads/Korus.png" alt="Company Logo" className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow border border-gray-200 bg-white" />
                    <div>
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900 tracking-wide leading-tight">Korus Engineering Solutions Pvt. Ltd.</h1>
                      <h4 className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed mt-1">
                        912, Pearls Best Heights-II, 9th Floor, Plot No. C-9, Netaji Subhash Place, Pitampura, Delhi - 110034
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center mt-4">
                <span className="text-base sm:text-lg font-semibold text-blue-700">CTC Slip</span>
                <span className="text-gray-600 font-medium text-sm sm:text-base">{viewSlip.month} {viewSlip.year}</span>
              </div>

              {/* Employee Info */}
              <div className="relative z-10 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Employee ID: <span className="font-semibold text-blue-900">{viewSlip.employeeId || '-'}</span></span>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Name: <span className="font-semibold text-blue-900">{viewSlip.employeeName || '-'}</span></span>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Department: <span className="font-semibold text-blue-900">{viewSlip.department || '-'}</span></span>
                    {isEditMode && editedData && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium text-gray-700 text-sm sm:text-base">Gross Salary:</span>
                        <Input
                          type="number"
                          value={editedData.grossSalary}
                          onChange={(e) => handleFieldChange('grossSalary', Number(e.target.value))}
                          className="w-32 text-right"
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="relative z-10 px-4 sm:px-6 py-4 bg-white">
                <div className="grid grid-cols-1 gap-6 sm:gap-8">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 border-b border-blue-100 pb-1">Earnings</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 text-sm sm:text-base">Basic Salary</span>
                        {isEditMode && editedData ? (
                          <Input
                            type="number"
                            value={editedData.basicSalary}
                            onChange={(e) => handleFieldChange('basicSalary', Number(e.target.value))}
                            className="w-32 text-right"
                            onWheel={(e) => e.currentTarget.blur()}
                          />
                        ) : (
                          <span className="font-semibold text-blue-900 text-sm sm:text-base">₹{viewSlip.basicSalary.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      
                      {/* Salary Allowances - Editable in edit mode */}
                      {isEditMode && editedData ? (
                        <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700 text-sm">Salary Allowances</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddAllowance}
                              className="h-6 text-xs"
                            >
                              + Add
                            </Button>
                          </div>
                          {(editedData.detailedSalaryAllowances || []).map((allowance, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                type="text"
                                placeholder="Allowance name"
                                value={allowance.name}
                                onChange={(e) => handleAllowanceChange(idx, 'name', e.target.value)}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={allowance.amount}
                                onChange={(e) => handleAllowanceChange(idx, 'amount', Number(e.target.value))}
                                className="w-32"
                                onWheel={(e) => e.currentTarget.blur()}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAllowance(idx)}
                                className="text-red-600 h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-medium text-gray-700 text-sm">Total</span>
                            <span className="font-semibold text-blue-900 text-sm">
                              ₹{((editedData.detailedSalaryAllowances || []).reduce((sum, a) => sum + a.amount, 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        viewSlip.salaryAllowances > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Salary Allowances</span>
                            <span className="font-semibold text-blue-900 text-sm sm:text-base">₹{viewSlip.salaryAllowances.toLocaleString('en-IN')}</span>
                          </div>
                        )
                      )}
                      
                      {viewSlip.variableAllowances > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 text-sm sm:text-base">Variable Allowances</span>
                          <span className="font-semibold text-blue-900 text-sm sm:text-base">₹{viewSlip.variableAllowances.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {viewSlip.fixedAllowances > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 text-sm sm:text-base">Fixed Allowances</span>
                          <span className="font-semibold text-blue-900 text-sm sm:text-base">₹{viewSlip.fixedAllowances.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-red-700 mb-3 border-b border-red-100 pb-1">Deductions</h3>
                    <div className="space-y-2">
                      {isEditMode && editedData ? (
                        <div className="space-y-2 pl-4 border-l-2 border-red-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700 text-sm">Salary Deductions</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddDeduction}
                              className="h-6 text-xs"
                            >
                              + Add
                            </Button>
                          </div>
                          {(editedData.detailedSalaryDeductions || []).map((deduction, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                type="text"
                                placeholder="Deduction name"
                                value={deduction.name}
                                onChange={(e) => handleDeductionChange(idx, 'name', e.target.value)}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={deduction.amount}
                                onChange={(e) => handleDeductionChange(idx, 'amount', Number(e.target.value))}
                                className="w-32"
                                onWheel={(e) => e.currentTarget.blur()}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDeduction(idx)}
                                className="text-red-600 h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-medium text-gray-700 text-sm">Total</span>
                            <span className="font-semibold text-red-600 text-sm">
                              -₹{((editedData.detailedSalaryDeductions || []).reduce((sum, d) => sum + d.amount, 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        viewSlip.salaryDeductions > 0 ? (
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Salary Deductions</span>
                            <span className="font-semibold text-red-600 text-sm sm:text-base">-₹{viewSlip.salaryDeductions.toLocaleString('en-IN')}</span>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm sm:text-base">No deductions</div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <span className="text-base sm:text-lg font-bold text-gray-900">Total CTC</span>
                  {isEditMode && editedData ? (
                    <span className="text-xl sm:text-2xl font-extrabold text-green-700">
                      ₹{(
                        editedData.basicSalary +
                        (editedData.detailedSalaryAllowances || []).reduce((sum, a) => sum + a.amount, 0) -
                        (editedData.detailedSalaryDeductions || []).reduce((sum, d) => sum + d.amount, 0) +
                        editedData.variableAllowances +
                        editedData.fixedAllowances
                      ).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-xl sm:text-2xl font-extrabold text-green-700">₹{viewSlip.totalCTC.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 text-center p-3 border-t border-gray-200 text-gray-700 text-xs sm:text-sm leading-relaxed bg-gradient-to-r from-white to-blue-50">
                Plot No. 32, Sector-4B, HSIIDC, Bahadurgarh, Haryana - 124507
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 px-4 sm:px-6 pb-4 print:hidden">
                <span className="italic text-gray-400 text-xs text-center sm:text-left">*This is a computer generated slip and does not require signature</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => {
                    if (slipRef.current) {
                      const printContents = slipRef.current.innerHTML;
                      const originalContents = document.body.innerHTML;
                      document.body.innerHTML = printContents;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload();
                    }
                  }} className="flex-1 sm:flex-none">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={() => setViewSlip(null)} className="flex-1 sm:flex-none">Close</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default HRCTC;
