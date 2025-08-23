import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Search, XCircle, CheckCircle, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllEmployees } from '@/utils/Employee';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Employee } from '@/utils/Employee';
import { getAllDepartments, Department } from '@/utils/Department';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { getAllLTCs, deleteLTC, approveOrRejectLTC, updateLTC } from '@/utils/LTC.tsx';

interface LTC {
  _id: string;
  employeeId: Employee;
  department: Department;
  serviceCompletionFrom: string;
  serviceCompletionTo: string;
  leavePeriodFrom: string;
  leavePeriodTo: string;
  reimbursementAmount: number;
  status: string;
  approvedBy: string;
  attachment?: {
    fileName: string;
    fileType: string;
    fileData: Buffer;
  };
  createdAt: string;
  updatedAt: string;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'secondary';
  }
};

const HRLTC: React.FC = () => {
  const [ltcs, setLtcs] = useState<LTC[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ltcToDelete, setLtcToDelete] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLTCs();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchLTCs = async () => {
    try {
      setLoading(true);
      const data = await getAllLTCs();
      setLtcs(data);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch LTC requests');
      setLtcs([]);
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

  const handleDelete = async (_id: string) => {
    setLtcToDelete(_id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (ltcToDelete) {
      try {
        await deleteLTC(ltcToDelete);
        toast.success('LTC request deleted successfully');
        fetchLTCs();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred');
      } finally {
        setDeleteDialogOpen(false);
        setLtcToDelete(null);
      }
    }
  };

  const handleApprove = async (ltcId: string) => {
    try {
      await approveOrRejectLTC('approve', ltcId);
      toast.success('LTC request approved successfully');
      fetchLTCs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleReject = async (ltcId: string) => {
    try {
      await approveOrRejectLTC('reject', ltcId);
      toast.success('LTC request rejected successfully');
      fetchLTCs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const exportToExcel = () => {
    const exportData = ltcs.map(ltc => ({
      'Employee ID': ltc.employeeId.employeeId,
      'Employee Name': ltc.employeeId.name,
      'Department': ltc.department.departmentName,
      'Service Completion From': ltc.serviceCompletionFrom ? new Date(ltc.serviceCompletionFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Service Completion To': ltc.serviceCompletionTo ? new Date(ltc.serviceCompletionTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Leave Period From': ltc.leavePeriodFrom ? new Date(ltc.leavePeriodFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Leave Period To': ltc.leavePeriodTo ? new Date(ltc.leavePeriodTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      'Reimbursement Amount': ltc.reimbursementAmount,
      'Status': ltc.status,
      'Approved By': ltc.approvedBy || '',
      'Created At': ltc.createdAt ? new Date(ltc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LTC Requests');
    XLSX.writeFile(wb, 'ltc_requests.xlsx');
  };

  const filteredLTCs = ltcs.filter(ltc => {
    const searchTerm = tableSearchTerm.toLowerCase();
    const employeeIdStr = ltc.employeeId.employeeId.toString();
    const employeeName = ltc.employeeId.name.toLowerCase();
    const status = ltc.status || 'pending';
    const paymentStatus = (ltc as any).paymentStatus || 'Not Paid';

    const matchesSearch = employeeIdStr.includes(tableSearchTerm) || employeeName.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesPayment = paymentStatusFilter === 'all' || paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leave Travel Concession (LTC)</h1>
          <p className="text-gray-600">Manage LTC requests and approvals</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>LTC Requests</CardTitle>
              <CardDescription>View and manage all LTC requests</CardDescription>
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
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="Not Paid">Not Paid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Fully Paid">Fully Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Service Period</TableHead>
                  <TableHead>Leave Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[120px]">Admin Remarks</TableHead>
                  <TableHead className="w-[120px]">Accounts Remarks</TableHead>
                  <TableHead className="w-[120px]">Payment Status</TableHead>
                  <TableHead className="w-[120px]">Attachment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLTCs.map((ltc, index) => (
                  <TableRow key={ltc._id}>
                    <TableCell>
                      <div className="font-medium">{index + 1}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{ltc.employeeId.employeeId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{ltc.employeeId.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{ltc.department.departmentName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {ltc.serviceCompletionFrom && ltc.serviceCompletionTo
                          ? `${new Date(ltc.serviceCompletionFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(ltc.serviceCompletionTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                          : ltc.serviceCompletionFrom
                            ? new Date(ltc.serviceCompletionFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : ltc.serviceCompletionTo
                              ? new Date(ltc.serviceCompletionTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : ''
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {ltc.leavePeriodFrom && ltc.leavePeriodTo
                          ? `${new Date(ltc.leavePeriodFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(ltc.leavePeriodTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                          : ltc.leavePeriodFrom
                            ? new Date(ltc.leavePeriodFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : ltc.leavePeriodTo
                              ? new Date(ltc.leavePeriodTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : ''
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{ltc.reimbursementAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Textarea
                        value={(ltc as any).adminRemarks || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLtcs(prev => prev.map(x => x._id === ltc._id ? { ...x, adminRemarks: value } as any : x));
                        }}
                        onBlur={async (e) => {
                          const form = new FormData();
                          form.append('adminRemarks', e.target.value);
                          await updateLTC(ltc._id, form);
                        }}
                        placeholder="Enter admin remarks"
                        rows={3}
                        className="min-h-[90px]"
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Textarea
                        value={(ltc as any).accountsRemarks || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLtcs(prev => prev.map(x => x._id === ltc._id ? { ...x, accountsRemarks: value } as any : x));
                        }}
                        onBlur={async (e) => {
                          const form = new FormData();
                          form.append('accountsRemarks', e.target.value);
                          await updateLTC(ltc._id, form);
                        }}
                        placeholder="Enter accounts remarks"
                        rows={3}
                        className="min-h-[90px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={(ltc as any).paymentStatus || 'Not Paid'}
                        onValueChange={async (value) => {
                          setLtcs(prev => prev.map(x => x._id === ltc._id ? { ...x, paymentStatus: value as any } as any : x));
                          const form = new FormData();
                          form.append('paymentStatus', value);
                          await updateLTC(ltc._id, form);
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Paid">Not Paid</SelectItem>
                          <SelectItem value="Fully Paid">Fully Paid</SelectItem>
                          <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {ltc.attachment ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            {
                            window.open(
                              `https://korus-ems-backend.vercel.app/api/ltc/attachment/${ltc._id}`,
                              "_blank"
                            )}
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
                      <Badge variant={getStatusBadgeColor(ltc.status)}>
                        {ltc.status.charAt(0).toUpperCase() + ltc.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ltc.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(ltc._id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReject(ltc._id)}
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
                          onClick={() => handleDelete(ltc._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this LTC request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setLtcToDelete(null);
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

export default HRLTC; 