import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Train, Car, Users, Edit, Trash2, UserPlus, Search, XCircle, CheckCircle, Download, Plus, X, FileText } from 'lucide-react';
import { getAllTravelExpenditures, deleteTravelExpenditure, TravelExpenditure, updateVoucherNo, approveOrRejectTravelExpenditure } from '@/utils/TravelExpenditure';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllEmployees } from '@/utils/Employee';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
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

const AdminTravelExpenditure: React.FC = () => {
  const [travelExpenditures, setTravelExpenditures] = useState<TravelExpenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [voucherLoadingId, setVoucherLoadingId] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState<{ [key: string]: string }>({});
  const [voucherEditId, setVoucherEditId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [travelExpenditureToDelete, setTravelExpenditureToDelete] = useState<string | null>(null);

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
      setError(null);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch travel expenditures');
      setTravelExpenditures([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      // Filter employees to only include those without a Date of Leaving (DOL)
      const activeEmployees = data.filter((emp: Employee) => !emp.dol);
      setEmployees(activeEmployees);
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
    setTravelExpenditureToDelete(_id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (travelExpenditureToDelete) {
      try {
        await deleteTravelExpenditure(travelExpenditureToDelete);
        toast.success('Travel expenditure deleted successfully');
        fetchTravelExpenditures();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred');
      } finally {
        setDeleteDialogOpen(false);
        setTravelExpenditureToDelete(null);
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
    const exportData = travelExpenditures.map(te => {
      const expensesTotal = te.expenses ? te.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0;
      const dayChargesTotal = te.dayCharges ? te.dayCharges.reduce((sum, charge) => sum + charge.amount, 0) : 0;

      return {
        'Employee Name': te.employeeId.name,
        'Designation': te.employeeId.designation,
        'Department': te.department.departmentName,
        'Place of Visit': te.placeOfVisit,
        'Client Name': te.clientName,
        'Project No': te.projectNo,
        'Start Date': te.startDate,
        'Return Date': te.returnDate,
        'Purpose of Visit': te.purposeOfVisit,
        'Travel Mode': te.travelMode,
        'Ticket Provided By': te.ticketProvidedBy,
        'Deputation Charges': te.deputationCharges,
        'Expenses Total': expensesTotal,
        'Day Charges Total': dayChargesTotal,
        'Total Amount': te.totalAmount,
        'Claimed From Client': te.claimedFromClient ? 'Yes' : 'No',
        'Status': te.status,
        'Voucher No': te.voucherNo || '',
        'Created At': te.createdAt ? new Date(te.createdAt).toLocaleDateString() : '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Travel Expenditures');
    XLSX.writeFile(wb, 'travel_expenditures.xlsx');
  };

  const filteredTravelExpenditures = travelExpenditures.filter(te => {
    const searchTerm = tableSearchTerm.toLowerCase();
    const employeeIdStr = te.employeeId.employeeId.toString();
    const employeeName = te.employeeId.name.toLowerCase();
    const status = te.status || 'pending';

    // Filter by search term
    const matchesSearch = employeeIdStr.includes(tableSearchTerm) || employeeName.includes(searchTerm);

    // Filter by status
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No travel expenditures found</div>
          <div className="text-gray-400 text-sm">Try adding a new travel expenditure</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Travel Expenditure Management</h1>
          <p className="text-gray-600">Manage travel expenditure requests and approvals</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Travel Expenditures</CardTitle>
              <CardDescription>View and manage all travel expenditure requests</CardDescription>
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
                    <SelectValue placeholder="Search by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Place of Visit</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Project No</TableHead>
                  <TableHead>Travel Info</TableHead>
                  <TableHead>Amount (Expenses + Day Charges)</TableHead>
                  <TableHead>Client Claim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Voucher</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTravelExpenditures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <div className="text-center">
                        <div className="text-gray-500 text-lg mb-2">
                          {tableSearchTerm ? 'No travel expenditures found matching your search' : 'No travel expenditures found'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {tableSearchTerm ? 'Try adjusting your search terms' : 'Try adding a new travel expenditure'}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTravelExpenditures.map((te, index) => {
                    const TravelModeIcon = getTravelModeIcon(te.travelMode);
                    return (
                      <TableRow key={te._id}>
                        <TableCell>
                          <div className="font-medium">{index + 1}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{te.employeeId.employeeId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{te.employeeId.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-500">{te.department?.departmentName || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-500">{te.placeOfVisit}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-500">{te.clientName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-500">{te.projectNo}</div>
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
                          <div className="text-xs text-gray-500">
                            <div>Expenses: ₹{te.expenses ? te.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString() : '0'}</div>
                            <div>Day Charges: ₹{te.dayCharges ? te.dayCharges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString() : '0'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={te.claimedFromClient ? 'success' : 'default'}>
                            {te.claimedFromClient ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeColor(te.status || 'pending')}>
                            {(te.status || 'pending').charAt(0).toUpperCase() + (te.status || 'pending').slice(1)}
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
                              <span className="text-sm">{te.voucherNo || ''}</span>
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
                          {te.attachment ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `https://korus-ems-backend.vercel.app/api/travel-expenditures/attachment/${te._id}`,
                                  "_blank"
                                )
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
                          <div className="flex items-center gap-2">
                            {te.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(te._id!)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleReject(te._id!)}
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
                              onClick={() => handleDelete(te._id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this travel expenditure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTravelExpenditureToDelete(null);
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

export default AdminTravelExpenditure; 