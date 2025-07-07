import React, { useState, useEffect } from 'react';
import { Message, getAllMessages, addMessage, editMessage, deleteMessage, replyMessage } from '@/utils/Message';
import { Employee, getAllEmployees } from '@/utils/Employee';
import { Department, getAllDepartments } from '@/utils/Department';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Plus, Send, Inbox, AlertCircle, CheckCircle, Search, Edit, Trash2, MessageSquare, ChevronDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// Extended Message interface for display
interface MessageWithPopulated extends Message {
  employeeId?: {
    _id?: string;
    userId: string;
    employeeId: number;
    name: string;
    email: string;
  };
  department?: {
    _id: string;
    departmentId: string;
    departmentName: string;
    description?: string;
  };
}

const HRMessages: React.FC = () => {
  const [messages, setMessages] = useState<MessageWithPopulated[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageWithPopulated | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isEmployeeSelectOpen, setIsEmployeeSelectOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'normal' | 'high' | 'urgent'>('all');

  const [newMessage, setNewMessage] = useState({
    employeeId: '',
    department: '',
    subject: '',
    priority: 'normal',
    message: ''
  });

  const [replyText, setReplyText] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMessageData, setEditMessageData] = useState<any>(null);

  useEffect(() => {
    fetchMessages();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getAllMessages();
      console.log(data);

      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      const sorted = data.sort((a, b) => a.employeeId - b.employeeId)
      setEmployees(sorted);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.employeeId || !newMessage.department || !newMessage.subject || !newMessage.message) {
      toast.error('Employee, Department, Subject, and Message are required');
      return;
    }

    setLoading(true);
    try {
      await addMessage(newMessage as any);
      toast.success('Message sent successfully');
      setIsAddDialogOpen(false);
      setNewMessage({ employeeId: '', department: '', subject: '', priority: 'normal', message: '' });
      setSelectedEmployee(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyMessage = async () => {
    if (!replyText.trim() || !selectedMessage?._id) {
      toast.error('Reply text is required');
      return;
    }

    setLoading(true);
    try {
      await replyMessage(selectedMessage._id, replyText);
      toast.success('Reply sent successfully');
      setIsReplyDialogOpen(false);
      setReplyText('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage?._id) return;

    setLoading(true);
    try {
      await deleteMessage(selectedMessage._id);
      toast.success('Message deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setLoading(false);
    }
  };

  const openReplyDialog = (message: MessageWithPopulated) => {
    setSelectedMessage(message);
    setReplyText(message.reply || '');
    setIsReplyDialogOpen(true);
  };

  const openDeleteDialog = (message: MessageWithPopulated) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getReplyBadgeColor = (reply: string | undefined) => {
    return reply ? 'success' : 'secondary';
  };

  const filteredMessages = messages.filter(message => {
    // Search by employeeId and name only
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (message.employeeId?.name || '').toLowerCase().includes(searchLower) ||
      (message.employeeId?.employeeId?.toString() || '').includes(searchLower);

    // Filter by priority
    let matchesPriority = true;
    if (priorityFilter !== 'all') {
      matchesPriority = message.priority === priorityFilter;
    }

    return matchesSearch && matchesPriority;
  });

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.employeeId.toString().includes(employeeSearchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const stats = {
    total: messages.length,
    withReply: messages.filter(m => m.reply && m.reply.trim() !== '').length,
    withoutReply: messages.filter(m => !m.reply || m.reply.trim() === '').length,
  };

  const openEditDialog = (message: MessageWithPopulated) => {
    setEditMessageData({
      _id: message._id,
      employeeId: message.employeeId?._id || '',
      department: message.department?._id || '',
      subject: message.subject,
      priority: message.priority,
      message: message.message
    });
    setIsEditDialogOpen(true);
    setSelectedEmployee(null);
  };

  const handleEditMessage = async () => {
    if (!editMessageData.employeeId || !editMessageData.department || !editMessageData.subject || !editMessageData.message) {
      toast.error('Employee, Department, Subject, and Message are required');
      return;
    }
    setLoading(true);
    try {
      await editMessage(editMessageData._id, {
        employeeId: editMessageData.employeeId,
        department: editMessageData.department,
        subject: editMessageData.subject,
        priority: editMessageData.priority,
        message: editMessageData.message
      } as any);
      toast.success('Message updated successfully');
      setIsEditDialogOpen(false);
      setEditMessageData(null);
      fetchMessages();
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to update message');
    } finally {
      setLoading(false);
    }
  };

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = filteredMessages.map(msg => ({
      'Emp ID': msg.employeeId?.employeeId,
      'Emp Name': msg.employeeId?.name,
      'Department': msg.department?.departmentName,
      'Subject': msg.subject,
      'Priority': msg.priority,
      'Message': msg.message,
      'Reply': msg.reply ? 'Yes' : 'No',
      'Date': formatDate(msg.createdAt),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Messages');
    XLSX.writeFile(workbook, 'messages.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Manage internal communications and announcements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
              <DialogDescription>Send a message to an employee</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="employee">Employee</Label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setIsEmployeeSelectOpen(!isEmployeeSelectOpen)}
                  >
                    {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.employeeId})` : 'Select Employee'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {isEmployeeSelectOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
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
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setNewMessage({
                              ...newMessage,
                              employeeId: employee._id!,
                              department: employee.department._id // Auto-populate department
                            });
                            setIsEmployeeSelectOpen(false);
                            setEmployeeSearchTerm('');
                          }}
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
                <Select
                  value={newMessage.department}
                  onValueChange={(value) => setNewMessage({ ...newMessage, department: value })}
                  disabled={!!selectedEmployee} // Disable when employee is selected
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedEmployee ? selectedEmployee.department.departmentName : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id!}>
                        {dept.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEmployee && (
                  <p className="text-sm text-gray-500">
                    Department automatically set to: {selectedEmployee.department.departmentName}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Enter message subject..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newMessage.priority} onValueChange={(value) => setNewMessage({ ...newMessage, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Type your message here..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setNewMessage({ employeeId: '', department: '', subject: '', priority: 'normal', message: '' });
                setSelectedEmployee(null);
              }}>Cancel</Button>
              <Button onClick={handleSendMessage} disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Reply</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withReply}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Without Reply</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withoutReply}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
          <CardDescription>Manage internal communications and announcements</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by employee ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={priorityFilter} onValueChange={value => setPriorityFilter(value as 'all' | 'normal' | 'high' | 'urgent')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>Emp Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Reply</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message._id}>
                  <TableCell className="font-medium">{message.employeeId?.employeeId}</TableCell>
                  <TableCell>{message.employeeId?.name}</TableCell>
                  <TableCell>{message.department?.departmentName}</TableCell>
                  <TableCell className="font-medium">{message.subject}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        message.priority === 'urgent' ? 'default' :
                          message.priority === 'high' ? 'rose' :
                            message.priority === 'normal' ? 'secondary' : 'default'
                      }
                    >
                      {message.priority?.charAt(0).toUpperCase() + message.priority?.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">{message.message}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getReplyBadgeColor(message.reply)}
                      className={message.reply ? 'cursor-pointer hover:bg-green-600' : ''}
                      onClick={() => message.reply && openReplyDialog(message)}
                    >
                      {message.reply ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">{formatDate(message.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(message)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(message)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMessage?.reply ? 'Edit Reply' : 'Add Reply'}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage?.reply
                ? 'Edit the existing reply to this message'
                : 'Add a reply to the message'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-black">
            <div className="grid gap-2">
              <Label htmlFor="reply">Reply</Label>
              <Textarea
                id="reply"
                value={replyText}
                disabled
                placeholder="Enter your reply..."
                rows={4}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteMessage} disabled={loading}>
              {loading ? "Deleting..." : "Delete Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogDescription>Edit the message details below</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setIsEmployeeSelectOpen(!isEmployeeSelectOpen)}
                >
                  {editMessageData && employees.find(e => e._id === editMessageData.employeeId)
                    ? `${employees.find(e => e._id === editMessageData.employeeId)?.name} (${employees.find(e => e._id === editMessageData.employeeId)?.employeeId})`
                    : 'Select Employee'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {isEmployeeSelectOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
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
                        onClick={() => {
                          setEditMessageData({
                            ...editMessageData,
                            employeeId: employee._id!,
                            department: employee.department._id
                          });
                          setIsEmployeeSelectOpen(false);
                          setEmployeeSearchTerm('');
                        }}
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
              <Select
                value={editMessageData?.department || ''}
                onValueChange={(value) => setEditMessageData({ ...editMessageData, department: value })}
                disabled={!!editMessageData && !!employees.find(e => e._id === editMessageData.employeeId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={editMessageData && employees.find(e => e._id === editMessageData.employeeId)
                    ? employees.find(e => e._id === editMessageData.employeeId)?.department.departmentName
                    : 'Select department'} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id!}>
                      {dept.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editMessageData && employees.find(e => e._id === editMessageData.employeeId) && (
                <p className="text-sm text-gray-500">
                  Department automatically set to: {employees.find(e => e._id === editMessageData.employeeId)?.department.departmentName}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={editMessageData?.subject || ''}
                onChange={(e) => setEditMessageData({ ...editMessageData, subject: e.target.value })}
                placeholder="Enter message subject..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={editMessageData?.priority || 'normal'} onValueChange={(value) => setEditMessageData({ ...editMessageData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={editMessageData?.message || ''}
                onChange={(e) => setEditMessageData({ ...editMessageData, message: e.target.value })}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditMessageData(null);
            }}>Cancel</Button>
            <Button onClick={handleEditMessage} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRMessages;
