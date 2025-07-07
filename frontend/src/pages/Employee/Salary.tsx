import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Eye, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSalaries } from '@/utils/Salary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EmployeeSalary: React.FC = () => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [currentSalary, setCurrentSalary] = useState<any | null>(null);
  const [viewSlip, setViewSlip] = useState<any | null>(null);
  const slipRef = useRef<HTMLDivElement>(null);

  // Get unique years and months from salaryHistory
  const years = Array.from(new Set(salaryHistory.map((s: any) => s.paymentYear))).sort((a, b) => b - a);
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchSalary = async () => {
      if (!user?._id) return;
      try {
        const data = await getUserSalaries(user._id);
        setSalaryHistory(data.salaries || []);
        const latest = (data.salaries || []).filter((s: any) => s.paymentYear === selectedYear).sort((a: any, b: any) => b.paymentMonth.localeCompare(a.paymentMonth))[0];
        setCurrentSalary(latest || null);
      } catch (err) {
        setSalaryHistory([]);
        setCurrentSalary(null);
      }
    };
    fetchSalary();
  }, [user?._id, selectedYear]);

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

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = salaryHistory
      .filter((record: any) =>
        (selectedYear === 'all' || record.paymentYear === selectedYear) &&
        (selectedMonth === 'all' || record.paymentMonth === selectedMonth)
      )
      .map(record => ({
        'Month': record.paymentMonth,
        'Year': record.paymentYear,
        'Payable Days': record.payableDays,
        'Sundays': record.sundays,
        'Net Payable Days': record.netPayableDays,
        'Gross Salary': record.grossSalary,
        'Basic Salary': record.basicSalary,
        'Allowances': (record.allowances?.reduce((sum: number, a: any) => sum + a.amount, 0) || 0),
        'Deductions': (record.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0),
        'Net Salary': (record.grossSalary - (record.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0)),
      }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary History');
    XLSX.writeFile(workbook, 'salary_history.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Information</h1>
          <p className="text-gray-600">View your salary details and history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary History</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salaryHistory.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salary History</CardTitle>
              <CardDescription>Your salary history for the selected year</CardDescription>
            </div>
            <Button
              variant="outline"
              className="ml-auto"
              onClick={handleDownloadExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Year:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Month:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {monthsList.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Payable Days</TableHead>
                <TableHead>Sundays</TableHead>
                <TableHead>Net Payable Days</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Slip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory
                .filter((record: any) =>
                  (selectedYear === 'all' || record.paymentYear === selectedYear) &&
                  (selectedMonth === 'all' || record.paymentMonth === selectedMonth)
                )
                .map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{record.paymentMonth}</TableCell>
                    <TableCell className="font-medium">{record.paymentYear}</TableCell>
                    <TableCell>{record.payableDays}</TableCell>
                    <TableCell>{record.sundays}</TableCell>
                    <TableCell>{record.netPayableDays}</TableCell>
                    <TableCell>₹{record.grossSalary.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.basicSalary.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-green-600">₹{(record.allowances?.reduce((sum: number, a: any) => sum + a.amount, 0) || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-red-600">₹{(record.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="font-bold">₹{(record.grossSalary - (record.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0)).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => setViewSlip(record)} title="View Salary Slip">
                        <Eye className="h-5 w-5 text-orange-600 hover:text-orange-800 transition" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Salary Slip Modal */}
      {viewSlip && (
        <Dialog open={!!viewSlip} onOpenChange={() => setViewSlip(null)}>
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
                <span className="text-gray-600 font-medium">{viewSlip.paymentMonth} {viewSlip.paymentYear}</span>
              </div>
              {/* Employee Info */}
              <div className="relative z-10 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 bg-white">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-700">Employee ID: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.employeeId || '-'}</span></span>
                  <span className="font-medium text-gray-700">Name: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.name || '-'}</span></span>
                  <span className="font-medium text-gray-700">Designation: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.designation || '-'}</span></span>
                  <span className="font-medium text-gray-700">Department: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.department?.departmentName || '-'}</span></span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-700">Payable Days: <span className="font-semibold text-blue-900">{viewSlip.payableDays}</span></span>
                  <span className="font-medium text-gray-700">Sundays: <span className="font-semibold text-blue-900">{viewSlip.sundays}</span></span>
                  <span className="font-medium text-gray-700">Net Payable Days: <span className="font-semibold text-blue-900">{viewSlip.netPayableDays}</span></span>
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
                          <td className="py-1 text-right font-semibold text-blue-900">₹{viewSlip.basicSalary.toLocaleString('en-IN')}</td>
                        </tr>
                        {viewSlip.allowances?.map((a: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-1 font-medium text-gray-700">{a.name}</td>
                            <td className="py-1 text-right font-semibold text-blue-900">₹{a.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2 border-b border-red-100 pb-1">Deductions</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        {viewSlip.deductions?.length ? viewSlip.deductions.map((d: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-1 font-medium text-gray-700">{d.name}</td>
                            <td className="py-1 text-right font-semibold text-red-600">-₹{d.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        )) : <tr><td className="py-1 text-gray-400" colSpan={2}>No deductions</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 border-t pt-2">
                  <span className="text-lg font-bold text-gray-900">Net Salary</span>
                  <span className="text-2xl font-extrabold text-green-700">₹{(viewSlip.grossSalary - (viewSlip.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0)).toLocaleString('en-IN')}</span>
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
                  <Button variant="outline" onClick={() => setViewSlip(null)} className="mt-0">Close</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\:hidden { display: none !important; }
          .print\:bg-white { background: white !important; }
          .print\:shadow-none { box-shadow: none !important; }
          .print\:border { border: 1px solid #e5e7eb !important; }
          .print\:rounded-none { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeSalary;
