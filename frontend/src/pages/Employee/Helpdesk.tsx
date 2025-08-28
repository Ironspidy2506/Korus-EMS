import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HelpCircle, Plus, Search, Clock, CheckCircle, AlertCircle, Trash, Pencil, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { getUserHelpdesks, Helpdesk, addHelpdesk, updateHelpdesk, deleteHelpdesk } from '@/utils/Helpdesk';
import { toast } from 'sonner';

const EmployeeHelpdesk: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Helpdesk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    query: '',
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Helpdesk | null>(null);
  const [editQuery, setEditQuery] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [user?._id]);

  const fetchTickets = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const data = await getUserHelpdesks(user._id);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!user?._id) return;
    try {
      const ticketData = {
        employeeId: user._id,
        query: newTicket.query,
      };
      const response = await addHelpdesk(ticketData);
      if (response.data.success) {
        toast.success('Ticket created successfully');
      } else {
        toast.error(response.data.message);
      }
      setNewTicket({ query: '' });
      setIsCreateOpen(false);
      fetchTickets(); // Refresh the list
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const handleEditTicket = async () => {
    if (!selectedTicket) return;
    try {
      await updateHelpdesk(selectedTicket._id, { query: editQuery });
      toast.success('Ticket updated successfully');
      setIsEditOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    try {
      await deleteHelpdesk(selectedTicket._id);
      toast.success('Ticket deleted successfully');
      setIsDeleteOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const search = searchTerm.trim().toLowerCase();
    const query = (ticket.query || '').toLowerCase();
    const helpId = (ticket.helpId || '').toLowerCase();
    const matchesSearch =
      !search ||
      query.includes(search) ||
      helpId.includes(search);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Open' && !ticket.status) ||
      (statusFilter === 'Resolved' && ticket.status);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: boolean) => {
    return status ? 'success' : 'destructive';
  };

  const getStatusIcon = (status: boolean) => {
    return status ?
      <CheckCircle className="h-4 w-4 text-green-600" /> :
      <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const openTickets = tickets.filter(t => !t.status).length;
  const resolvedTickets = tickets.filter(t => t.status).length;

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = filteredTickets.map(ticket => ({
      'Ticket ID': ticket.helpId,
      'Query': ticket.query,
      'Response': ticket.response || 'No response',
      'Status': ticket.status ? 'Resolved' : 'Open',
      'Created Date': formatDate(ticket.date || ''),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Helpdesk Tickets');
    XLSX.writeFile(workbook, 'helpdesk_tickets.xlsx');
  };



  return (
    <div className="space-y-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Helpdesk</h1>
          <p className="text-gray-600">Submit and track your support requests</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Describe your issue by raising a ticket</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="query">Query</Label>
                <Textarea
                  id="query"
                  value={newTicket.query}
                  onChange={(e) => setNewTicket({ ...newTicket, query: e.target.value })}
                  placeholder="Describe your issue in detail"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTicket}>Create Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <HelpCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
          </CardContent>
        </Card>
        <Card className="border-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedTickets}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Support Tickets</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets by Id or query..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[220px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="ml-auto bg-primary hover:bg-primary/90 text-white"
                onClick={handleDownloadExcel}
              >
                <Download className="h-4 w-4 mr-2" />
                Download as Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-300 hover:bg-gray-300'>
                <TableHead className="font-bold text-black">S.No</TableHead>
                <TableHead className="font-bold text-black">Ticket ID</TableHead>
                <TableHead className="font-bold text-black">Query</TableHead>
                <TableHead className="font-bold text-black">Response</TableHead>
                <TableHead className="font-bold text-black">Status</TableHead>
                <TableHead className="font-bold text-black">Created Date</TableHead>
                <TableHead className="font-bold text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket, index) => (
                <TableRow key={ticket._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{ticket.helpId}</TableCell>
                  <TableCell className="max-w-xs">{ticket.query}</TableCell>
                  <TableCell className="max-w-xs">{ticket.response || 'No response'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status ? 'Resolved' : 'Open'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(ticket.date || '')}</TableCell>
                  <TableCell>
                    {!ticket.status ? <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setEditQuery(ticket.query);
                          setIsEditOpen(true);
                        }}
                        aria-label="Edit Ticket"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsDeleteOpen(true);
                        }}
                        aria-label="Delete Ticket"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div> : null}

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setSelectedTicket(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>Update your ticket query</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-query">Query</Label>
              <Textarea
                id="edit-query"
                value={editQuery}
                onChange={(e) => setEditQuery(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditTicket}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Ticket Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => { setIsDeleteOpen(open); if (!open) setSelectedTicket(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>Are you sure you want to delete this ticket? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTicket}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeHelpdesk;
