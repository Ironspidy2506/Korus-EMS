
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Mail, Send, Inbox, Star, Trash2, Search, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
}

const EmployeeWebmail: React.FC = () => {
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '' });

  const emails: Email[] = [
    {
      id: '1',
      from: 'hr@company.com',
      subject: 'Welcome to the team!',
      preview: 'We are excited to have you join our team. Here are some important details...',
      time: '10:30 AM',
      isRead: false,
      isStarred: true,
      isImportant: true
    },
    {
      id: '2',
      from: 'manager@company.com',
      subject: 'Weekly Team Meeting',
      preview: 'Reminder about our weekly team meeting scheduled for tomorrow at 2 PM...',
      time: '9:15 AM',
      isRead: true,
      isStarred: false,
      isImportant: false
    },
    {
      id: '3',
      from: 'it-support@company.com',
      subject: 'System Maintenance Notice',
      preview: 'Scheduled maintenance will occur this weekend. Please save your work...',
      time: 'Yesterday',
      isRead: true,
      isStarred: false,
      isImportant: false
    },
    {
      id: '4',
      from: 'payroll@company.com',
      subject: 'Payslip for January 2024',
      preview: 'Your payslip for January 2024 is now available in the employee portal...',
      time: '2 days ago',
      isRead: false,
      isStarred: true,
      isImportant: true
    }
  ];

  const folders = [
    { id: 'inbox', name: 'Inbox', count: emails.filter(e => !e.isRead).length },
    { id: 'starred', name: 'Starred', count: emails.filter(e => e.isStarred).length },
    { id: 'sent', name: 'Sent', count: 0 },
    { id: 'drafts', name: 'Drafts', count: 0 },
    { id: 'trash', name: 'Trash', count: 0 }
  ];

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFolder === 'starred') return email.isStarred && matchesSearch;
    return matchesSearch;
  });

  const handleSendEmail = () => {
    console.log('Sending email:', newEmail);
    setNewEmail({ to: '', subject: '', body: '' });
    setIsComposeOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webmail</h1>
          <p className="text-gray-600">Manage your company emails</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
              <DialogDescription>Send a new email</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                  placeholder="recipient@company.com"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
                  placeholder="Type your message here..."
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.filter(e => !e.isRead).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.filter(e => e.isStarred).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Inbox className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Important</CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.filter(e => e.isImportant).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Folders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "default" : "ghost"}
                className="w-full justify-between"
                onClick={() => setSelectedFolder(folder.id)}
              >
                <span>{folder.name}</span>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email List</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                    !email.isRead ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`font-medium ${!email.isRead ? 'font-bold' : ''}`}>
                          {email.from}
                        </span>
                        {email.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        {email.isImportant && <Badge variant="destructive" className="text-xs">Important</Badge>}
                      </div>
                      <div className={`text-sm mb-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {email.preview}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-gray-500">{email.time}</span>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeWebmail;
