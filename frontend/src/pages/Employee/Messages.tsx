import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, User, Clock, Plus, Search, Reply } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Message, getUsersMessage, replyMessage } from '@/utils/Message';
import { useToast } from '@/hooks/use-toast';

const EmployeeMessages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'normal'
  });

  const [priorityFilter, setPriorityFilter] = useState<'all' | 'normal' | 'high' | 'urgent'>('all');

  useEffect(() => {
    if (user?._id) {
      getUsersMessage(user._id).then(setMessages);
    }
  }, [user]);

  const filteredMessages = messages.filter(message => {
    const search = searchTerm.trim().toLowerCase();
    const subject = (message.subject || '').toLowerCase();
    const content = (message.message || '').toLowerCase();
    const matchesSearch =
      !search ||
      subject.includes(search) ||
      content.includes(search);
    let matchesPriority = true;
    if (priorityFilter !== 'all') {
      matchesPriority = message.priority === priorityFilter;
    }
    return matchesSearch && matchesPriority;
  });

  const handleSendMessage = () => {
    console.log('Sending message:', newMessage);
    setNewMessage({ recipient: '', subject: '', content: '', priority: 'normal' });
    setIsComposeOpen(false);
  };

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setReplyContent('');
    setIsReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReply(true);
    try {
      await replyMessage(selectedMessage._id!, replyContent);
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      setIsReplyOpen(false);
      setReplyContent('');
      setSelectedMessage(null);
      // Refresh messages
      if (user?._id) {
        getUsersMessage(user._id).then(setMessages);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      default: return 'outline';
    }
  };

  // Update the helper function to format date as dd-mm-yyyy, hh:mm AM/PM
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hourStr = String(hours).padStart(2, '0');
    return `${day}-${month}-${year}, ${hourStr}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your colleagues and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.priority === 'high').length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.priority === 'urgent').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle>Messages</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-gray-400" />
              <Input
                placeholder="Search by subject or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-lg"
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message._id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">
                          {message.employeeId?.name || 'Unknown'}
                        </span>
                        <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                          {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-sm mb-2">
                        {message.subject}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {message.message}
                      </div>
                      {message.reply && (
                        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border-l-4 border-orange-500">
                          <strong>Reply:</strong> {message.reply}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{message.createdAt ? formatDate(message.createdAt) : ''}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReply(message)}
                      className="flex items-center space-x-1"
                    >
                      <Reply className="h-3 w-3" />
                      <span>Reply</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Send a reply to this message
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label className="font-bold">From:</Label>
                <p className="text-sm text-gray-600">{selectedMessage.employeeId?.name}</p>
              </div>
              <div>
                <Label className="font-bold">Subject:</Label>
                <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
              </div>
              <div>
                <Label className="font-bold">Original Message:</Label>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedMessage.message}</p>
              </div>
              <div>
                <Label htmlFor="reply-content" className="font-bold">Your Reply:</Label>
                <Textarea
                  id="reply-content"
                  placeholder="Type your reply here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReplyOpen(false);
                setReplyContent('');
                setSelectedMessage(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={isSendingReply || !replyContent.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isSendingReply ? 'Sending...' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeMessages;
