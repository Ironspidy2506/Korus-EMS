import React, { useState, useEffect } from 'react';
import { Helpdesk, getAllHelpdesks, addHelpdesk, updateHelpdesk, deleteHelpdesk, resolveHelpdesk, addResponse } from '@/utils/Helpdesk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Headphones, Plus, Search, AlertCircle, CheckCircle, Clock, XCircle, MessageSquare, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const HRHelpdesk: React.FC = () => {
  const [helpdesks, setHelpdesks] = useState<Helpdesk[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHelpdesk, setSelectedHelpdesk] = useState<Helpdesk | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchHelpdesks();
  }, []);

  const fetchHelpdesks = async () => {
    try {
      const data = await getAllHelpdesks();
      setHelpdesks(data);
    } catch (error) {
      console.error('Error fetching helpdesks:', error);
      toast.error('Failed to fetch helpdesk tickets');
    }
  };

  const handleResolveHelpdesk = async (id: string) => {
    setLoading(true);
    try {
      await resolveHelpdesk(id);
      toast.success('Helpdesk ticket resolved successfully');
      fetchHelpdesks();
    } catch (error) {
      console.error('Error resolving helpdesk:', error);
      toast.error('Failed to resolve helpdesk ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim() || !selectedHelpdesk?._id) {
      toast.error('Response text is required');
      return;
    }

    setLoading(true);
    try {
      await addResponse(selectedHelpdesk._id, responseText);
      toast.success('Response added successfully');
      setIsResponseDialogOpen(false);
      setResponseText('');
      setSelectedHelpdesk(null);
      fetchHelpdesks();
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response');
    } finally {
      setLoading(false);
    }
  };

  const openResponseDialog = (helpdesk: Helpdesk) => {
    setSelectedHelpdesk(helpdesk);
    setResponseText(helpdesk.response || '');
    setIsResponseDialogOpen(true);
  };

  const openDeleteDialog = (helpdesk: Helpdesk) => {
    setSelectedHelpdesk(helpdesk);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusBadgeColor = (status: boolean) => {
    return status ? 'success' : 'warning';
  };

  const filteredHelpdesks = helpdesks.filter(helpdesk =>
    helpdesk.helpId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    helpdesk.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    helpdesk.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    helpdesk.employeeId.employeeId.toString().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: helpdesks.length,
    open: helpdesks.filter(h => !h.status).length,
    resolved: helpdesks.filter(h => h.status).length,
    withResponse: helpdesks.filter(h => h.response && h.response.trim() !== '').length
  };

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = filteredHelpdesks.map(h => ({
      'Ticket ID': h.helpId,
      'Emp ID': h.employeeId.employeeId,
      'Employee Name': h.employeeId.name,
      'Query': h.query,
      'Date': h.date ? formatDate(h.date) : 'N/A',
      'Status': h.status ? 'Resolved' : 'Open',
      'Response': h.response ? 'Yes' : 'No',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Helpdesk Tickets');
    XLSX.writeFile(workbook, 'helpdesk_tickets.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Helpdesk Management</h1>
          <p className="text-gray-600">Manage employee support tickets and requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Headphones className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Response</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withResponse}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Helpdesk Tickets</CardTitle>
          <CardDescription>Manage and respond to employee support tickets</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets by ID, query, or employee ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
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
                <TableHead>Ticket ID</TableHead>
                <TableHead>Emp ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Query</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHelpdesks.map((helpdesk) => (
                <TableRow key={helpdesk._id}>
                  <TableCell className="font-medium">{helpdesk.helpId}</TableCell>
                  <TableCell>{helpdesk.employeeId.employeeId}</TableCell>
                  <TableCell>{helpdesk.employeeId.name}</TableCell>
                  <TableCell className="max-w-xs">{helpdesk.query}</TableCell>
                  <TableCell>{helpdesk.date ? formatDate(helpdesk.date) : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeColor(helpdesk.status)}>
                      {helpdesk.status ? 'Resolved' : 'Open'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={helpdesk.response ? 'info' : 'secondary'}
                      className={helpdesk.response ? 'cursor-pointer hover:bg-blue-600' : ''}
                      onClick={() => helpdesk.response && openResponseDialog(helpdesk)}
                    >
                      {helpdesk.response ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {!helpdesk.status && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResolveHelpdesk(helpdesk._id!)}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResponseDialog(helpdesk)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedHelpdesk?.response ? 'Edit Response' : 'Add Response'}
            </DialogTitle>
            <DialogDescription>
              {selectedHelpdesk?.response 
                ? 'Edit the existing response for this helpdesk ticket' 
                : 'Add a response to the helpdesk ticket'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="response">Response</Label>
              <Textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Enter your response..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsResponseDialogOpen(false);
              setResponseText('');
              setSelectedHelpdesk(null);
            }}>Cancel</Button>
            <Button onClick={handleAddResponse} disabled={loading}>
              {loading ? "Saving..." : (selectedHelpdesk?.response ? "Update Response" : "Add Response")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRHelpdesk;
