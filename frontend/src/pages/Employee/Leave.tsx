import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Briefcase, Sun, Moon, Heart, MinusCircle, Check, Download, Trash, Pencil } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { Leave, applyForLeave, updateLeave, deleteLeave, getUserLeaves } from '@/utils/Leave';
import { getAllEmployees, Employee } from '@/utils/Employee';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EmployeeLeave: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [Leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [appliedTo, setAppliedTo] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<File | undefined>(undefined);
  const [newRequest, setNewRequest] = useState<Omit<Leave, 'appliedTo' | 'attachment' | 'type'> & { type: Leave['type'] }>({
    employeeId: user?._id || '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: '',
    type: 'el',
    days: 0,
    status: 'Pending',
  });
  const [searchLead, setSearchLead] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      const sorted = data.sort((a: Employee, b: Employee) => a.employeeId - b.employeeId);
      setEmployees(sorted);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast(error.message);
    }
  };

  const fetchLeaves = async () => {
    try {
      const data = await getUserLeaves(user._id);
      setLeaves(data.leaves || []);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (newRequest.startDate && newRequest.endDate) {
      const startDateTime = new Date(
        `${newRequest.startDate}T${newRequest.startTime || "09:30"}`
      );
      const endDateTime = new Date(
        `${newRequest.endDate}T${newRequest.endTime || "18:00"}`
      );

      let totalDays =
        Math.floor((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const startHour = startDateTime.getHours();
      const startMinutes = startDateTime.getMinutes();
      const endHour = endDateTime.getHours();
      const endMinutes = endDateTime.getMinutes();

      // Office working hours
      const officeStartMinutes = 9 * 60 + 30; // 9:30 AM
      const halfDayMinutes = 13 * 60 + 30; // 1:30 PM
      const officeEndMinutes = 18 * 60; // 6:00 PM

      const startTimeInMinutes = startHour * 60 + startMinutes;
      const endTimeInMinutes = endHour * 60 + endMinutes;

      if (newRequest.startDate === newRequest.endDate) {
        // Same-day leave
        if (endTimeInMinutes <= halfDayMinutes) {
          totalDays = 0.5; // Half-day leave
        } else {
          totalDays = 1; // Full-day leave
        }
      } else {
        // Multi-day leave calculation
        if (startTimeInMinutes > halfDayMinutes) {
          totalDays -= 0.5; // First day is half
        }
        if (endTimeInMinutes < halfDayMinutes) {
          totalDays -= 0.5; // Last day is half
        }
      }

      totalDays = Math.max(totalDays, 0);
      setNewRequest((prev) => ({ ...prev, days: totalDays }));
    }
  }, [newRequest.startDate, newRequest.endDate, newRequest.startTime, newRequest.endTime]);

  useEffect(() => {
    if (!isDialogOpen) {
      setEditId(null);
      setNewRequest({
        employeeId: user?._id || '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        reason: '',
        type: 'el',
        days: 0,
        status: 'Pending',
      });
      setAppliedTo([]);
      setAttachment(undefined);
      setSearchLead('');
    }
  }, [isDialogOpen, user?._id]);

  const handleSubmitRequest = async () => {
    try {
      const formData = new FormData();
      formData.append('employeeId', newRequest.employeeId);
      formData.append('startDate', newRequest.startDate);
      formData.append('startTime', newRequest.startTime);
      formData.append('endDate', newRequest.endDate);
      formData.append('endTime', newRequest.endTime);
      formData.append('reason', newRequest.reason);
      formData.append('type', newRequest.type);
      formData.append('days', String(newRequest.days));
      formData.append('appliedTo', JSON.stringify(appliedTo));
      if (attachment) {
        formData.append('attachment', attachment);
      }
      if (editId) {
        const response = await updateLeave(editId, formData);
        if (response.data.success) {
          toast.success(response.data.message)
        } else {
          toast.error(response.data.message)
        }

      } else {
        const response = await applyForLeave(newRequest.employeeId, formData);
        if (response.data.success) {
          toast.success(response.data.message)
        } else {
          toast.error(response.data.message)
        }
      }
      // Refresh
      const data = await getUserLeaves(user._id);
      setLeaves(data.leaves || []);
      setIsDialogOpen(false);
      setEditId(null);
      setNewRequest({
        employeeId: user?._id || '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        reason: '',
        type: 'el',
        days: 0,
        status: 'Pending',
      });
      setAppliedTo([]);
      setAttachment(undefined);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (leave: Leave) => {
    setEditId(leave._id || null);
    setNewRequest({
      employeeId: leave.employeeId,
      startDate: leave.startDate ? leave.startDate.split('T')[0] : '',
      startTime: leave.startTime,
      endDate: leave.endDate ? leave.endDate.split('T')[0] : '',
      endTime: leave.endTime,
      reason: leave.reason,
      type: leave.type,
      days: leave.days,
      status: leave.status || 'Pending',
    });
    setAppliedTo(leave.appliedTo || []);
    setAttachment(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const response = await deleteLeave(id);
    if (response.data.success) {
      toast.success(response.data.message)
    } else {
      toast.error(response.data.message)
    }
    const data = await getUserLeaves(user._id);
    setLeaves(data.leaves || []);
  };

  // Find the current employee for leave balance
  const currentEmployee = employees.find(emp => emp.userId?._id === user?._id);
  const leaveBalance = currentEmployee?.leaveBalance || {
    el: 0, sl: 0, cl: 0, od: 0, lwp: 0, lhd: 0, others: 0
  };
  const totalBalance = Object.values(leaveBalance).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);

  const getStatusBadgeColor = useCallback((status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  }, []);

  const getLeaveTypeLabel = useCallback((type: string) => {
    const typeMap: { [key: string]: string } = {
      'el': 'Earned Leave',
      'sl': 'Sick Leave',
      'cl': 'Casual Leave',
      'od': 'On Duty',
      'lwp': 'Leave Without Pay',
      'lhd': 'Half Day Leave',
      'others': 'Others'
    };
    return typeMap[type] || type;
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

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = Leaves.map(request => ({
      'Leave Type': getLeaveTypeLabel(request.type),
      'Start Date': formatDate(request.startDate),
      'Start Time': formatTime(request.startTime),
      'End Date': formatDate(request.endDate),
      'End Time': formatTime(request.endTime),
      'Days': request.days,
      'Reason': request.reason,
      'Attachment': request.attachment ? 'Yes' : 'No',
      'Reason of Rejection': request.status === 'rejected' ? request.ror : '',
      'Status': request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Requests');
    XLSX.writeFile(workbook, 'leave_requests.xlsx');
  };

  return (
    <div className="space-y-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage your leave requests and view balance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="flex gap-2">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-0.5" />
                Apply Leave
              </Button>
              {user.role === "lead" ? <Button className="bg-secondary hover:bg-secondary/90" onClick={() => navigate('/lead-dashboard/approve-reject-leave')}>
                <Check className="h-4 w-4 mr-2" />
                Approve/Reject Leave
              </Button> : null}
            </div>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] p-0 max-h-[80vh] overflow-y-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription>Submit a new leave request</DialogDescription>
              </DialogHeader>
              <form className="space-y-6 mt-2">
                <div>
                  <Label htmlFor="appliedTo" className="block mb-2 font-medium">Applying To</Label>
                  <Select
                    value={appliedTo[0] || ''}
                    onValueChange={value => setAppliedTo([value])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a lead..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search lead..."
                          value={searchLead}
                          onChange={e => setSearchLead(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {employees.filter(emp => (emp.role === "lead") && (`${emp.employeeId} - ${emp.name}`.toLowerCase().includes(searchLead.toLowerCase()))).map((emp: Employee) => (
                        <SelectItem key={emp._id} value={emp._id!}>
                          {emp.employeeId} - {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {appliedTo[0] && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span>Selected: </span>
                      {employees.filter(emp => emp._id === appliedTo[0]).map(emp => `${emp.employeeId} - ${emp.name}`)}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="block mb-2 font-medium">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newRequest.startDate}
                      onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime" className="block mb-2 font-medium">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newRequest.startTime}
                      onChange={(e) => setNewRequest({ ...newRequest, startTime: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endDate" className="block mb-2 font-medium">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newRequest.endDate}
                      onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="block mb-2 font-medium">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newRequest.endTime}
                      onChange={(e) => setNewRequest({ ...newRequest, endTime: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="days" className="block mb-2 font-medium">Number of Days</Label>
                  <Input
                    id="days"
                    type="number"
                    value={newRequest.days}
                    onChange={(e) => setNewRequest({ ...newRequest, days: Number(e.target.value) })}
                    className="w-full"
                    onWheel={e => e.currentTarget.blur()}
                  />
                </div>
                <div>
                  <Label htmlFor="leaveType" className="block mb-2 font-medium">Leave Type</Label>
                  <Select value={newRequest.type} onValueChange={(value) => setNewRequest({ ...newRequest, type: value as Leave['type'] })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="el">Earned Leave (EL)</SelectItem>
                      <SelectItem value="sl">Sick Leave (SL)</SelectItem>
                      <SelectItem value="cl">Casual Leave (CL)</SelectItem>
                      <SelectItem value="od">On Duty (OD)</SelectItem>
                      <SelectItem value="lwp">Leave without pay (LWP)</SelectItem>
                      <SelectItem value="lhd">Late Hours Deduction (LHD)</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason" className="block mb-2 font-medium">Reason</Label>
                  <Textarea
                    id="reason"
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div>
                  <div>
                    <Label htmlFor="attachment" className="block mb-2 font-medium">Attachment</Label>
                    <Input
                      id="attachment"
                      type="file"
                      onChange={(e) => setAttachment(e.target.files?.[0])}
                      className="w-full"
                    />
                  </div>

                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" onClick={handleSubmitRequest} className="w-full md:w-auto">{editId ? 'Update Request' : 'Submit Request'}</Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBalance} days</div>
          </CardContent>
        </Card>
        <Card className="border-blue-600">

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.el} days</div>
          </CardContent>
        </Card>
        <Card className="border-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.sl} days</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
            <Sun className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.cl} days</div>
          </CardContent>
        </Card>
        <Card className="border-indigo-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.od} days</div>
          </CardContent>
        </Card>
        <Card className="border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Without Pay</CardTitle>
            <MinusCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.lwp} days</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Hours Dedcutions</CardTitle>
            <Moon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.lhd} days</div>
          </CardContent>
        </Card>
        <Card className="border-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Others</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.others} days</div>
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Leave Requests</CardTitle>
              <CardDescription>Track your submitted leave requests</CardDescription>
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
                <TableHead className="font-bold text-black">Leave Type</TableHead>
                <TableHead className="font-bold text-black">Start Date</TableHead>
                <TableHead className="font-bold text-black">Start Time</TableHead>
                <TableHead className="font-bold text-black">End Date</TableHead>
                <TableHead className="font-bold text-black">End Time</TableHead>
                <TableHead className="font-bold text-black">Days</TableHead>
                <TableHead className="font-bold text-black">Reason</TableHead>
                <TableHead className="font-bold text-black">Attachment</TableHead>
                <TableHead className="font-bold text-black">Reason of Rejection</TableHead>
                <TableHead className="font-bold text-black">Status</TableHead>
                <TableHead className="font-bold text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Leaves.map((request, index) => (
                <TableRow key={request._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{getLeaveTypeLabel(request.type)}</TableCell>
                  <TableCell>{formatDate(request.startDate)}</TableCell>
                  <TableCell>{formatTime(request.startTime)}</TableCell>
                  <TableCell>{formatDate(request.endDate)}</TableCell>
                  <TableCell>{formatTime(request.endTime)}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>{request.reason}</TableCell>
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
                    {request.status === "rejected" ? request.ror : ""}
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
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label="Edit Ticket"
                          onClick={() => handleEdit(request)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label="Delete Ticket"
                          onClick={() => {
                            setDeleteId(request._id!);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {deleteId && (
        <DeleteLeaveDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={() => {
            handleDelete(deleteId);
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
};

// Delete Confirmation Dialog
function DeleteLeaveDialog({ open, onOpenChange, onDelete }: { open: boolean, onOpenChange: (v: boolean) => void, onDelete: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Leave Request</DialogTitle>
          <DialogDescription>Are you sure you want to delete this leave request? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EmployeeLeave;
