import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, FileText, Calendar, Clock, User, Download, CheckCircle, XCircle, Paperclip, MessageSquare, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllLeaves, approveOrRejectLeave, updateReasonOfRejection, deleteLeave } from '@/utils/Leave';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 20; // Show 20 items per page for better performance

// Month names array
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const HRLeave: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [editingRejectionId, setEditingRejectionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdatingRejection, setIsUpdatingRejection] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeleteRejectedDialogOpen, setIsDeleteRejectedDialogOpen] = useState(false);
  const [isDeletingRejected, setIsDeletingRejected] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getLeaveTypeLabel = useCallback((type: string) => {
    const typeMap: { [key: string]: string } = {
      'el': 'Earned Leave',
      'sl': 'Sick Leave',
      'cl': 'Casual Leave',
      'od': 'On Duty',
      'lwp': 'Leave Without Pay',
      'lhd': 'Late Hours Deduction',
      'others': 'Others'
    };
    return typeMap[type] || type;
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const response = await getAllLeaves();
      if (response && response.leaves) {
        setLeaveRequests(response.leaves);
      } else if (Array.isArray(response)) {
        setLeaveRequests(response);
      } else {
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast({
        title: "Error",
        description: "Failed to load leave requests. Please try again.",
        variant: "destructive",
      });
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate years: previous year and upcoming 5 years
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    // Previous year to upcoming 5 years (currentYear - 1 to currentYear + 5)
    for (let i = currentYear - 1; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years.sort((a, b) => b - a); // Sort descending (newest first)
  }, []);

  // Memoized filtered data - CRITICAL for performance
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter((request: any) => {
      // Filter out leave requests from employees with DOL (Date of Leaving)
      if (request.employeeId?.dol) {
        return false;
      }

      const matchesSearch = searchTerm === '' ||
        request.employeeId?.employeeId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || request.status === statusFilter;

      const matchesLeaveType = leaveTypeFilter === 'All' || getLeaveTypeLabel(request.type) === leaveTypeFilter;

      // Month and Year filtering
      let matchesMonth = monthFilter === 'All';
      let matchesYear = yearFilter === 'All';

      if (monthFilter !== 'All' || yearFilter !== 'All') {
        const startDate = request.startDate ? new Date(request.startDate) : null;
        if (startDate) {
          if (monthFilter !== 'All') {
            const monthIndex = monthNames.indexOf(monthFilter);
            matchesMonth = startDate.getMonth() === monthIndex;
          }
          if (yearFilter !== 'All') {
            matchesYear = startDate.getFullYear().toString() === yearFilter;
          }
        } else {
          matchesMonth = false;
          matchesYear = false;
        }
      }

      return matchesSearch && matchesStatus && matchesLeaveType && matchesMonth && matchesYear;
    });
  }, [leaveRequests, searchTerm, statusFilter, leaveTypeFilter, monthFilter, yearFilter, getLeaveTypeLabel]);

  // Memoized paginated data - CRITICAL for performance
  const paginatedLeaveRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLeaveRequests.slice(startIndex, endIndex);
  }, [filteredLeaveRequests, currentPage]);

  // Memoized stats calculation - CRITICAL for performance
  const stats = useMemo(() => {
    const pending = leaveRequests.filter((r: any) => r.status === 'pending').length;
    const approved = leaveRequests.filter((r: any) => r.status === 'approved').length;
    const rejected = leaveRequests.filter((r: any) => r.status === 'rejected').length;
    const total = leaveRequests.length;

    return { pending, approved, rejected, total };
  }, [leaveRequests]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(filteredLeaveRequests.length / ITEMS_PER_PAGE);
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredLeaveRequests.length);

    return {
      totalPages,
      startItem,
      endItem,
      totalItems: filteredLeaveRequests.length,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredLeaveRequests.length, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, leaveTypeFilter, monthFilter, yearFilter]);

  const handleApprove = useCallback(async (leaveId: string) => {
    try {
      const response = await approveOrRejectLeave('approved', leaveId);
      if (response.data.success) {

        toast({
          title: "Success",
          description: "Leave request approved successfully",
        });
        fetchLeaves(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: `${response.data.message}`,
        });
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleReject = useCallback(async (leaveId: string) => {
    try {
      const response = await approveOrRejectLeave('rejected', leaveId);
      if (response.data.success) {

        toast({
          title: "Success",
          description: "Leave request rejected successfully",
        });
        fetchLeaves(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: `${response.data.message}`,
        });
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleEditRejectionReason = useCallback((leaveId: string, currentReason: string) => {
    setEditingRejectionId(leaveId);
    setRejectionReason(currentReason || '');
  }, []);

  const handleUpdateRejectionReason = useCallback(async (leaveId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingRejection(true);
    try {
      const response = await updateReasonOfRejection(leaveId, rejectionReason);
      if (response.data.success) {
        toast({
          title: "Success",
          description: `${response.data.message}`,
        });
        setEditingRejectionId(null);
        setRejectionReason('');
        fetchLeaves(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to update rejection reason",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating rejection reason:", error);
      toast({
        title: "Error",
        description: "Failed to update rejection reason",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRejection(false);
    }
  }, [rejectionReason, toast]);

  const handleCancelEdit = useCallback(() => {
    setEditingRejectionId(null);
    setRejectionReason('');
  }, []);

  const handleDeleteAllApproved = useCallback(async () => {
    setIsDeletingAll(true);
    try {
      const approvedLeaves = leaveRequests.filter((leave: any) => leave.status === 'approved');

      if (approvedLeaves.length === 0) {
        toast({
          title: "Info",
          description: "No approved leaves to delete",
        });
        setIsDeleteAllDialogOpen(false);
        return;
      }

      const deletePromises = approvedLeaves.map((leave: any) =>
        fetch(`https://korus-ems-backend.vercel.app/api/leaves/${leave._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletions = responses.filter(response => !response.ok);

      if (failedDeletions.length === 0) {
        toast({
          title: "Success",
          description: `Successfully deleted ${approvedLeaves.length} approved leave requests`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Deleted ${approvedLeaves.length - failedDeletions.length} out of ${approvedLeaves.length} approved leave requests`,
          variant: "destructive",
        });
      }

      setIsDeleteAllDialogOpen(false);
      fetchLeaves(); // Refresh the list
    } catch (error) {
      console.error("Error deleting all approved leaves:", error);
      toast({
        title: "Error",
        description: "Failed to delete approved leave requests",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
    }
  }, [leaveRequests, toast]);

  const handleCancelDeleteAll = useCallback(() => {
    setIsDeleteAllDialogOpen(false);
  }, []);

  const handleDeleteAllRejected = useCallback(async () => {
    setIsDeletingRejected(true);
    try {
      const rejectedLeaves = leaveRequests.filter((leave: any) => leave.status === 'rejected');

      if (rejectedLeaves.length === 0) {
        toast({
          title: "Info",
          description: "No rejected leaves to delete",
        });
        setIsDeleteRejectedDialogOpen(false);
        return;
      }

      const deletePromises = rejectedLeaves.map((leave: any) =>
        fetch(`https://korus-ems-backend.vercel.app/api/leaves/${leave._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletions = responses.filter(response => !response.ok);

      if (failedDeletions.length === 0) {
        toast({
          title: "Success",
          description: `Successfully deleted ${rejectedLeaves.length} rejected leave requests`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Deleted ${rejectedLeaves.length - failedDeletions.length} out of ${rejectedLeaves.length} rejected leave requests`,
          variant: "destructive",
        });
      }

      setIsDeleteRejectedDialogOpen(false);
      fetchLeaves(); // Refresh the list
    } catch (error) {
      console.error("Error deleting all rejected leaves:", error);
      toast({
        title: "Error",
        description: "Failed to delete rejected leave requests",
        variant: "destructive",
      });
    } finally {
      setIsDeletingRejected(false);
    }
  }, [leaveRequests, toast]);

  const handleCancelDeleteRejected = useCallback(() => {
    setIsDeleteRejectedDialogOpen(false);
  }, []);

  const handleDeleteClick = useCallback((leave: any) => {
    setLeaveToDelete(leave);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!leaveToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteLeave(leaveToDelete._id);
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Leave deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setLeaveToDelete(null);
        fetchLeaves(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete leave",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting leave:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete leave",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [leaveToDelete, toast]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setLeaveToDelete(null);
  }, []);

  const handleView = useCallback((leave: any) => {
    setSelectedLeave(leave);
    setIsViewDialogOpen(true);
  }, []);

  const getStatusBadgeColor = useCallback((status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const formatTime = useCallback((timeString: string) => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600">Review and manage employee leave requests</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leave requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Review and manage employee leave requests</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/hr-dashboard/leave-balances')}>
          <Calendar className="h-4 w-4" />
          Leave Balances
        </Button>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={() => setIsDeleteAllDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete All Approved
        </Button>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={() => setIsDeleteRejectedDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete All Rejected
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>Review and approve/reject employee leave requests</CardDescription>
          <div className="flex items-center gap-2 mt-4 pt-2 overflow-x-auto pb-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Employee ID or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-56 md:w-64 min-w-[10rem]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 sm:w-40 min-w-[8rem]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger className="w-36 sm:w-48 min-w-[9rem]">
                <SelectValue placeholder="Filter by leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Leave Types</SelectItem>
                <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                <SelectItem value="On Duty">On Duty</SelectItem>
                <SelectItem value="Leave Without Pay">Leave Without Pay</SelectItem>
                <SelectItem value="Late Hours Deduction">Late Hours Deduction</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-32 sm:w-40 min-w-[8rem]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Months</SelectItem>
                {monthNames.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-28 sm:w-32 min-w-[7rem]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const tableData = filteredLeaveRequests.map((request: any, index: number) => ({
                  'S.No.': index + 1,
                  'Employee ID': request.employeeId?.employeeId,
                  'Employee Name': request.employeeId?.name,
                  'Department': request.employeeId?.department?.departmentName,
                  'Leave Type': getLeaveTypeLabel(request.type),
                  'Start Date': formatDate(request.startDate),
                  'Start Time': formatTime(request.startTime),
                  'End Date': formatDate(request.endDate),
                  'End Time': formatTime(request.endTime),
                  'Days': request.days,
                  'Reason': request.reason,
                  'Status': request.status,
                  'Approved By': request.approvedBy || '',
                  'Rejected By': request.rejectedBy || '',
                  'Reason of Rejection': request.ror || '',
                }));
                const worksheet = XLSX.utils.json_to_sheet(tableData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveRequests');
                XLSX.writeFile(workbook, 'LeaveRequests.xlsx');
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No.</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason of Rejection</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm || statusFilter !== 'All' || leaveTypeFilter !== 'All' || monthFilter !== 'All' || yearFilter !== 'All'
                        ? 'No leave requests match your search criteria.'
                        : 'No leave requests found.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeaveRequests.map((request: any, index: number) => (
                  <TableRow key={request._id}>
                    <TableCell className='font-medium'>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                    <TableCell className="font-medium">{request.employeeId?.employeeId}</TableCell>
                    <TableCell>{request.employeeId?.name}</TableCell>
                    <TableCell>{request.employeeId?.department?.departmentName}</TableCell>
                    <TableCell>{getLeaveTypeLabel(request.type)}</TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatTime(request.startTime)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell>{formatTime(request.endTime)}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>
                      <div className="max-w-xs" title={request.reason}>
                        {request.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.attachment ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://korus-ems-backend.vercel.app/api/leaves/attachment/${request._id}`,
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
                      <div className="flex flex-col gap-1">
                        <Badge variant={getStatusBadgeColor(request.status)}>
                          {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                        </Badge>
                        {request.approvedBy && request.status === "approved" && (
                          <span className="text-xs text-green-600">by {request.approvedBy}</span>
                        )}
                        {request.rejectedBy && request.status === "rejected" && (
                          <span className="text-xs text-red-600">by {request.rejectedBy}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'rejected' && !request.ror ? (
                        editingRejectionId === request._id ? (
                          <div className="space-y-2">
                            <Input
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Enter rejection reason..."
                              className="w-full"
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateRejectionReason(request._id)}
                                disabled={isUpdatingRejection}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {isUpdatingRejection ? 'Saving...' : 'Save'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRejectionReason(request._id, request.ror)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {request.ror ? 'Edit' : 'Add'}
                            </Button>
                          </div>
                        )
                      ) : (
                        <span className="text-sm text-gray-500">{request.ror}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(request._id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {request.status !== 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(request._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(request)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-700">
                Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationInfo.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {paginationInfo.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationInfo.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Leave Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Employee ID</Label>
                  <p>{selectedLeave.employeeId?.employeeId}</p>
                </div>
                <div>
                  <Label className="font-bold">Employee Name</Label>
                  <p>{selectedLeave.employeeId?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Department</Label>
                  <p>{selectedLeave.employeeId?.department?.departmentName}</p>
                </div>
                <div>
                  <Label className="font-bold">Leave Type</Label>
                  <p>{getLeaveTypeLabel(selectedLeave.type)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Start Date</Label>
                  <p>{formatDate(selectedLeave.startDate)}</p>
                </div>
                <div>
                  <Label className="font-bold">Start Time</Label>
                  <p>{formatTime(selectedLeave.startTime)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">End Date</Label>
                  <p>{formatDate(selectedLeave.endDate)}</p>
                </div>
                <div>
                  <Label className="font-bold">End Time</Label>
                  <p>{formatTime(selectedLeave.endTime)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Days</Label>
                  <p>{selectedLeave.days}</p>
                </div>
                <div>
                  <Label className="font-bold">Status</Label>
                  <div className="flex flex-col gap-1">
                    <Badge variant={getStatusBadgeColor(selectedLeave.status)} className="w-fit">
                      {selectedLeave.status?.charAt(0).toUpperCase() + selectedLeave.status?.slice(1)}
                    </Badge>
                    {selectedLeave.approvedBy && selectedLeave.status === "approved" && (
                      <span className="text-xs text-green-600">by {selectedLeave.approvedBy}</span>
                    )}
                    {selectedLeave.rejectedBy && selectedLeave.status === "rejected" && (
                      <span className="text-xs text-red-600">by {selectedLeave.rejectedBy}</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="font-bold">Reason</Label>
                <p className="text-sm text-gray-600">{selectedLeave.reason}</p>
              </div>
              {selectedLeave.attachment && (
                <div>
                  <Label className="font-bold">Attachment</Label>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() =>
                        window.open(
                          `https://korus-ems-backend.vercel.app/api/leaves/attachment/${selectedLeave._id}`,
                          "_blank"
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Attachment
                    </Button>
                  </div>
                </div>
              )}
              {selectedLeave.approvedBy && (
                <div>
                  <Label className="font-bold">Approved By</Label>
                  <p>{selectedLeave.approvedBy}</p>
                </div>
              )}
              {selectedLeave.rejectedBy && (
                <div>
                  <Label className="font-bold">Rejected By</Label>
                  <p>{selectedLeave.rejectedBy}</p>
                </div>
              )}
              {selectedLeave.ror && (
                <div>
                  <Label className="font-bold">Reason of Rejection</Label>
                  <p className="text-sm text-gray-600">{selectedLeave.ror}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete All Approved Confirmation Dialog */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete All Approved Leaves</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all approved leave requests?
              <br />
              <span className="text-sm text-gray-600">
                This will delete {leaveRequests.filter((leave: any) => leave.status === 'approved').length} approved leave requests.
              </span>
              <br />
              <span className="text-red-600 font-semibold">
                This action cannot be undone and will permanently remove all approved leave records.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancelDeleteAll}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllApproved}
              disabled={isDeletingAll}
            >
              {isDeletingAll ? 'Deleting...' : 'Delete All Approved'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Rejected Confirmation Dialog */}
      <Dialog open={isDeleteRejectedDialogOpen} onOpenChange={setIsDeleteRejectedDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete All Rejected Leaves</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all rejected leave requests?
              <br />
              <span className="text-sm text-gray-600">
                This will delete {leaveRequests.filter((leave: any) => leave.status === 'rejected').length} rejected leave requests.
              </span>
              <br />
              <span className="text-red-600 font-semibold">
                This action cannot be undone and will permanently remove all rejected leave records.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancelDeleteRejected}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllRejected}
              disabled={isDeletingRejected}
            >
              {isDeletingRejected ? 'Deleting...' : 'Delete All Rejected'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Single Leave Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leave request?
              <br />
              {leaveToDelete && (
                <>
                  <span className="text-sm text-gray-600">
                    <strong>Employee:</strong> {leaveToDelete.employeeId?.name} ({leaveToDelete.employeeId?.employeeId})
                    <br />
                    <strong>Leave Type:</strong> {getLeaveTypeLabel(leaveToDelete.type)}
                    <br />
                    <strong>Days:</strong> {leaveToDelete.days}
                    <br />
                    <strong>Status:</strong> {leaveToDelete.status?.charAt(0).toUpperCase() + leaveToDelete.status?.slice(1)}
                  </span>
                </>
              )}
              <br />
              <span className="text-red-600 font-semibold">
                This action cannot be undone and will permanently remove this leave record.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default HRLeave;
