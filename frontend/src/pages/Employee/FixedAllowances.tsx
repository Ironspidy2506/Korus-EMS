
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Home, Car, Gift, Heart, Download, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { FixedAllowance, getUserFixedAllowances } from '@/utils/FixedAllowance';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const ALLOWANCE_TYPE_LABELS: Record<string, string> = {
  bonus: 'Bonus',
  loyaltyBonus: 'Loyalty Bonus',
  specialAllowance: 'Special Allowance',
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

const EmployeeFixedAllowances: React.FC = () => {
  const { user } = useAuth();
  const [fixedAllowances, setFixedAllowances] = useState<FixedAllowance[]>([]);
  const uniqueBenefits = new Set(fixedAllowances.map(a => a.allowanceType)).size;

  const getFixedAllowances = async () => {
    try {
      const response = await getUserFixedAllowances(user._id);
      if (response.data.success) {
        setFixedAllowances(response.data.allowances || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getFixedAllowances();
  })

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = fixedAllowances.map(a => ({
      'Allowance Type': ALLOWANCE_TYPE_LABELS[a.allowanceType] || a.allowanceType,
      'Amount': a.allowanceAmount,
      'Month': a.allowanceMonth,
      'Year': a.allowanceYear,
      'Status': a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending',
      'Voucher No.': a.voucherNo,
      'Attachment': a.attachment ? 'Yes' : 'No',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fixed Allowances');
    XLSX.writeFile(workbook, 'fixed_allowances.xlsx');
  };

  return (
    <div className="space-y-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Fixed Allowances</h1>
          <p className="text-gray-600">View your current allowances and benefits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allowances</CardTitle>
            <Gift className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixedAllowances.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefits</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueBenefits}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Allowance Details</CardTitle>
              <CardDescription>Complete list of your allowances</CardDescription>
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
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-300 hover:bg-gray-300'>
                <TableHead className="font-bold text-black">S.No</TableHead>
                <TableHead className="font-bold text-black">Allowance Type</TableHead>
                <TableHead className="font-bold text-black">Amount</TableHead>
                <TableHead className="font-bold text-black">Month</TableHead>
                <TableHead className="font-bold text-black">Year</TableHead>
                <TableHead className="font-bold text-black">Status</TableHead>
                <TableHead className="font-bold text-black">Voucher No.</TableHead>
                <TableHead className="font-bold text-black">Attachment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedAllowances.map((a, index) => (
                <TableRow key={a._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
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
                    {a.voucherNo}
                  </TableCell>
                  <TableCell>
                    {a.attachment ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://korus-ems-backend.vercel.app/api/fixed-allowances/attachment/${a._id}`,
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeFixedAllowances;
