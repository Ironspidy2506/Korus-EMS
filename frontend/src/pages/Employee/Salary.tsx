import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Eye, Download, Lock, Key, Mail } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSalaries } from '@/utils/Salary';
import {
  verifySalaryPassword,
  setSalaryPassword,
  sendSalaryPasswordResetOtp,
  resetSalaryPassword
} from '@/utils/SalaryPassword';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const EmployeeSalary: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [currentSalary, setCurrentSalary] = useState<any | null>(null);
  const [viewSlip, setViewSlip] = useState<any | null>(null);
  const slipRef = useRef<HTMLDivElement>(null);

  // Password protection states
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [salaryPass, setSalaryPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Get unique years and months from salaryHistory
  const years = Array.from(new Set(salaryHistory.map((s: any) => s.paymentYear))).sort((a, b) => b - a);
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    // Check if user has access to salary
    if (user?._id && !isPasswordVerified) {
      setShowPasswordModal(true);
    }
  }, [user?._id, isPasswordVerified]);

  useEffect(() => {
    const fetchSalary = async () => {
      if (!user?._id || !isPasswordVerified) return;
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
  }, [user?._id, selectedYear, isPasswordVerified]);

  // Password verification handler
  const handlePasswordVerification = async () => {
    if (!salaryPass.trim()) {
      toast({
        title: "Error",
        description: "Please enter your salary password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifySalaryPassword(salaryPass);
      if (result && result.success) {
        if (result.requiresPasswordSet) {
          setShowPasswordModal(false);
          setShowSetPasswordModal(true);
        } else {
          setIsPasswordVerified(true);
          setShowPasswordModal(false);
          setSalaryPass('');
          toast({
            title: "Success",
            description: "Salary password verified successfully",
          });
        }
      } else {
        // Keep modal open and clear password field on failure
        setSalaryPass('');
        toast({
          title: "Error",
          description: (result && result.message) || "Incorrect password",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Keep modal open and clear password field on error
      setSalaryPass('');
      toast({
        title: "Error",
        description: "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set password handler
  const handleSetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await setSalaryPassword(newPassword);
      if (result && result.success) {
        setIsPasswordVerified(true);
        setShowSetPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: "Success",
          description: "Salary password set successfully",
        });
      } else {
        toast({
          title: "Error",
          description: (result && result.message) || "Failed to set password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while setting password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send reset OTP handler
  const handleSendResetOtp = async () => {
    setIsLoading(true);
    try {
      const result = await sendSalaryPasswordResetOtp();
      if (result && result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setShowResetPasswordModal(true);
      } else {
        toast({
          title: "Error",
          description: (result && result.message) || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password handler
  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetSalaryPassword(otp, newPassword);
      if (result && result.success) {
        setIsPasswordVerified(true);
        setShowResetPasswordModal(false);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: "Success",
          description: "Salary password reset successfully",
        });
      } else {
        toast({
          title: "Error",
          description: (result && result.message) || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while resetting password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintSlip = () => {
    if (slipRef.current) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContents = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Salary Slip - ${viewSlip?.paymentMonth} ${viewSlip?.paymentYear}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: white; 
                  color: black;
                }
                .salary-slip { 
                  max-width: 800px; 
                  margin: 0 auto; 
                  background: white; 
                  border: 1px solid #ccc; 
                  border-radius: 8px; 
                  overflow: hidden;
                }
                .header { 
                  background: linear-gradient(to right, #f0f9ff, white); 
                  padding: 20px; 
                  border-bottom: 1px solid #bfdbfe; 
                  text-align: center;
                }
                .company-logo { 
                  width: 60px; 
                  height: 60px; 
                  border-radius: 50%; 
                  margin: 0 auto 10px; 
                  display: block;
                }
                .company-name { 
                  font-size: 18px; 
                  font-weight: bold; 
                  color: #1e3a8a; 
                  margin-bottom: 5px;
                }
                .company-address { 
                  font-size: 12px; 
                  color: #374151; 
                  line-height: 1.4;
                }
                .title { 
                  text-align: center; 
                  padding: 15px 0; 
                  background: white;
                }
                .title h2 { 
                  font-size: 16px; 
                  font-weight: bold; 
                  color: #1d4ed8; 
                  margin: 0 0 5px 0;
                }
                .title p { 
                  font-size: 14px; 
                  color: #6b7280; 
                  margin: 0;
                }
                .employee-info { 
                  padding: 20px; 
                  border-bottom: 1px solid #e5e7eb; 
                  background: white;
                }
                .info-grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 2px;
                }
                .info-item:nth-child(2) { 
                  padding-left: 160px; 
                }
                .info-item:nth-child(4) { 
                  padding-left: 160px; 
                }
                .info-item { 
                  font-size: 12px; 
                  margin-bottom: 8px;
                }
                .info-label { 
                  font-weight: 500; 
                  color: #374151;
                }
                .info-value { 
                  font-weight: 600; 
                  color: #1e3a8a;
                }
                .salary-details { 
                  padding: 20px; 
                  background: white;
                }
                .section { 
                  margin-bottom: 20px;
                }
                .section-title { 
                  font-size: 14px; 
                  font-weight: 600; 
                  margin-bottom: 10px; 
                  padding-bottom: 5px; 
                  border-bottom: 1px solid #e5e7eb;
                }
                .earnings-title { color: #1e3a8a; }
                .deductions-title { color: #dc2626; }
                .salary-item { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  margin-bottom: 8px; 
                  font-size: 12px;
                }
                .item-name { 
                  font-weight: 500; 
                  color: #374151;
                }
                .item-amount { 
                  font-weight: 600;
                }
                .earnings-amount { color: #1e3a8a; }
                .deductions-amount { color: #dc2626; }
                .net-salary { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  margin-top: 15px; 
                  padding-top: 15px; 
                  border-top: 1px solid #e5e7eb;
                }
                .net-label { 
                  font-size: 14px; 
                  font-weight: bold; 
                  color: #111827;
                }
                .net-amount { 
                  font-size: 18px; 
                  font-weight: 800; 
                  color: #059669;
                }
                .footer { 
                  text-align: center; 
                  padding: 15px; 
                  background: linear-gradient(to right, white, #f0f9ff); 
                  border-top: 1px solid #e5e7eb; 
                  font-size: 11px; 
                  color: #374151;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  .salary-slip { border: none; border-radius: 0; }
                }
              </style>
            </head>
            <body>
              <div class="salary-slip">
                <div class="header">
                  <img src="/uploads/Korus.png" alt="Company Logo" class="company-logo">
                  <div class="company-name">Korus Engineering Solutions Pvt. Ltd.</div>
                  <div class="company-address">912, Pearls Best Heights-II, 9th Floor, Plot No. C-9, Netaji Subhash Place, Pitampura, Delhi - 110034</div>
                </div>
                
                <div class="title">
                  <h2>Salary Slip</h2>
                  <p>${viewSlip?.paymentMonth} ${viewSlip?.paymentYear}</p>
                </div>
                
                <div class="employee-info">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Employee ID:</span> 
                      <span class="info-value">${viewSlip?.employeeId?.employeeId || '-'}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Department:</span> 
                      <span class="info-value">${viewSlip?.employeeId?.department?.departmentName || '-'}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Name:</span> 
                      <span class="info-value">${viewSlip?.employeeId?.name || '-'}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Payable Days:</span> 
                      <span class="info-value">${viewSlip?.payableDays}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Designation:</span> 
                      <span class="info-value">${viewSlip?.employeeId?.designation || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div class="salary-details">
                  <div class="section">
                    <div class="section-title earnings-title">Earnings</div>
                    <div class="salary-item">
                      <span class="item-name">Basic Salary</span>
                      <span class="item-amount earnings-amount">₹${viewSlip?.basicSalary?.toLocaleString('en-IN')}</span>
                    </div>
                    ${viewSlip?.allowances?.map((a: any) => `
                      <div class="salary-item">
                        <span class="item-name">${a.name}</span>
                        <span class="item-amount earnings-amount">₹${a.amount.toLocaleString('en-IN')}</span>
                      </div>
                    `).join('') || ''}
                  </div>
                  
                  <div class="section">
                    <div class="section-title deductions-title">Deductions</div>
                    ${viewSlip?.deductions?.length ? viewSlip.deductions.map((d: any) => `
                      <div class="salary-item">
                        <span class="item-name">${d.name}</span>
                        <span class="item-amount deductions-amount">-₹${d.amount.toLocaleString('en-IN')}</span>
                      </div>
                    `).join('') : '<div class="salary-item"><span class="item-name">No deductions</span></div>'}
                  </div>
                  
                  <div class="net-salary">
                    <span class="net-label">Net Salary</span>
                    <span class="net-amount">₹${(viewSlip?.grossSalary - (viewSlip?.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <div class="footer">
                  Plot No. 32, Sector-4B, HSIIDC, Bahadurgarh, Haryana - 124507
                </div>
              </div>
            </body>
          </html>
        `;

        printWindow.document.write(printContents);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        // Fallback to original method if popup is blocked
        const printContents = slipRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
      }
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

  // If password is not verified, show password modal
  if (!isPasswordVerified) {
    return (
      <>
        {/* Password Verification Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Salary Access Required
              </DialogTitle>
              <DialogDescription>
                Please enter your salary password to access your salary information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salaryPassword">Salary Password</Label>
                <Input
                  id="salaryPassword"
                  type="password"
                  placeholder="Enter your salary password"
                  value={salaryPass}
                  onChange={(e) => setSalaryPass(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerification()}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePasswordVerification}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSendResetOtp}
                  disabled={isLoading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Set Password Modal */}
        <Dialog open={showSetPasswordModal} onOpenChange={setShowSetPasswordModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                Set Salary Password
              </DialogTitle>
              <DialogDescription>
                Please set a password to protect your salary information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetPassword()}
                />
              </div>
              <Button
                onClick={handleSetPassword}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Setting..." : "Set Password"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Password Modal */}
        <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-600" />
                Reset Salary Password
              </DialogTitle>
              <DialogDescription>
                Enter the OTP sent to your email and set a new password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetNewPassword">New Password</Label>
                <Input
                  id="resetNewPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetConfirmPassword">Confirm Password</Label>
                <Input
                  id="resetConfirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                />
              </div>
              <Button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Main salary content (only shown after password verification)
  return (
    <div className="space-y-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Information</h1>
          <p className="text-gray-600">View your salary details and history</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => {
            setIsPasswordVerified(false);
            setShowPasswordModal(true);
          }}
        >
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className='border border-primary'>
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
              className="ml-auto bg-primary hover:bg-primary/90 text-white"
              onClick={handleDownloadExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm whitespace-nowrap">Year:</span>
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
              <span className="font-medium text-sm whitespace-nowrap">Month:</span>
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
              <TableRow className='bg-gray-300 hover:bg-gray-300'>
                <TableHead className="font-bold text-black">S.No</TableHead>
                <TableHead className="font-bold text-black">Month</TableHead>
                <TableHead className="font-bold text-black">Year</TableHead>
                <TableHead className="font-bold text-black">Payable Days</TableHead>
                <TableHead className="font-bold text-black">Gross Salary</TableHead>
                <TableHead className="font-bold text-black">Basic Salary</TableHead>
                <TableHead className="font-bold text-black">Allowances</TableHead>
                <TableHead className="font-bold text-black">Deductions</TableHead>
                <TableHead className="font-bold text-black">Net Salary</TableHead>
                <TableHead className="font-bold text-black">Slip</TableHead>
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
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{record.paymentMonth}</TableCell>
                    <TableCell className="font-medium">{record.paymentYear}</TableCell>
                    <TableCell>{record.payableDays}</TableCell>
                    <TableCell>₹{record.grossSalary.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.basicSalary.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-green-600">+₹{(record.allowances?.reduce((sum: number, a: any) => sum + a.amount, 0) || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-red-600">-₹{(record.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="font-bold">₹{(record.grossSalary - (record.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0)).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => setViewSlip(record)} title="View Salary Slip">
                        <Eye className="h-5 w-5 text-primary-600 hover:text-primary-800 transition" />
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
          <DialogContent className="max-w-[160vw] w-[160vw] p-0 mx-1 sm:mx-0 sm:max-w-2xl sm:w-auto rounded-lg">
            <div ref={slipRef} className="relative bg-white rounded-xl shadow-2xl border border-gray-300 print:bg-white print:shadow-none print:border print:rounded-none overflow-y-auto max-h-[90vh] w-full">
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
                <span className="text-base sm:text-lg font-semibold text-blue-700">Salary Slip</span>
                <span className="text-gray-600 font-medium text-sm sm:text-base">{viewSlip.paymentMonth} {viewSlip.paymentYear}</span>
              </div>

              {/* Employee Info */}
              <div className="relative z-10 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Employee ID: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.employeeId || '-'}</span></span>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Name: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.name || '-'}</span></span>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Designation: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.designation || '-'}</span></span>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Department: <span className="font-semibold text-blue-900">{viewSlip.employeeId?.department?.departmentName || '-'}</span></span>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Payable Days: <span className="font-semibold text-blue-900">{viewSlip.payableDays}</span></span>
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
                        <span className="font-semibold text-blue-900 text-sm sm:text-base">₹{viewSlip.basicSalary.toLocaleString('en-IN')}</span>
                      </div>
                      {viewSlip.allowances?.map((a: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 text-sm sm:text-base">{a.name}</span>
                          <span className="font-semibold text-blue-900 text-sm sm:text-base">₹{a.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-red-700 mb-3 border-b border-red-100 pb-1">Deductions</h3>
                    <div className="space-y-2">
                      {viewSlip.deductions?.length ? viewSlip.deductions.map((d: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 text-sm sm:text-base">{d.name}</span>
                          <span className="font-semibold text-red-600 text-sm sm:text-base">-₹{d.amount.toLocaleString('en-IN')}</span>
                        </div>
                      )) : (
                        <div className="text-gray-400 text-sm sm:text-base">No deductions</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <span className="text-base sm:text-lg font-bold text-gray-900">Net Salary</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-green-700">₹{(viewSlip.grossSalary - (viewSlip.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 text-center p-3 border-t border-gray-200 text-gray-700 text-xs sm:text-sm leading-relaxed bg-gradient-to-r from-white to-blue-50">
                Plot No. 32, Sector-4B, HSIIDC, Bahadurgarh, Haryana - 124507
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 px-4 sm:px-6 pb-4 print:hidden">
                <span className="italic text-gray-400 text-xs text-center sm:text-left">*This is a computer generated slip and does not require signature</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={handlePrintSlip} className="flex-1 sm:flex-none">Print</Button>
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
