
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, PieChart, BarChart3, Search, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllSalaries } from '@/utils/Salary';
import { getAllAllowances } from '@/utils/Allowance';
import { getAllFixedAllowances } from '@/utils/FixedAllowance';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

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
}

const AdminCTC: React.FC = () => {
  const [ctcData, setCtcData] = useState<CTCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

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
            totalCTC: (salary.basicSalary || 0) + salaryAllowances - salaryDeductions
          });
        } else {
          const existing = ctcMap.get(key)!;
          existing.grossSalary = salary.grossSalary || 0;
          existing.basicSalary = salary.basicSalary || 0;
          existing.salaryAllowances = salaryAllowances;
          existing.salaryDeductions = salaryDeductions;
          existing.totalCTC = (salary.basicSalary || 0) + salaryAllowances - salaryDeductions + existing.variableAllowances + existing.fixedAllowances;
        }
      });

      // Process allowances - only include approved ones
      allowances.forEach((allowance: any) => {
        // Only process approved allowances
        if (allowance.status !== 'approved') {
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
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCTCData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCTC;
