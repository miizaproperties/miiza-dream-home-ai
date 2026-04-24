import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, MessageSquare, Search, Calendar, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { API_BASE_URL } from '../../config/api';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const fetchContacts = async (): Promise<Contact[]> => {
  const response = await fetch(`${API_BASE_URL}/contacts/contacts/`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return Array.isArray(data) ? data : (data.results || []);
};

const markAsRead = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/contacts/contacts/${id}/mark-read/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to mark as read');
  return response.json();
};

const bulkMarkAsRead = async (ids: number[]) => {
  const promises = ids.map(id => markAsRead(id));
  await Promise.all(promises);
};

const deleteContact = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/contacts/contacts/${id}/`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete contact');
};

const bulkDeleteContacts = async (ids: number[]) => {
  const promises = ids.map(id => deleteContact(id));
  await Promise.all(promises);
};

export const ViewContacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: contacts, isLoading, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Contact marked as read');
    },
    onError: () => {
      toast.error('Failed to mark contact as read');
    },
  });

  const bulkMarkAsReadMutation = useMutation({
    mutationFn: bulkMarkAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      setSelectedContacts([]);
      toast.success('Contacts marked as read');
    },
    onError: () => {
      toast.error('Failed to mark contacts as read');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      setSelectedContacts([]);
      toast.success('Contacts deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete contacts');
    },
  });

  const handleMarkAsRead = async (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleBulkMarkAsRead = () => {
    if (selectedContacts.length === 0) return;
    bulkMarkAsReadMutation.mutate(selectedContacts);
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;
    setDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedContacts);
  };

  const filteredContacts = contacts?.filter((contact) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !contact.name.toLowerCase().includes(search) &&
        !contact.email.toLowerCase().includes(search) &&
        !contact.subject.toLowerCase().includes(search) &&
        !contact.message.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    // Read status filter
    if (filterRead === 'read' && !contact.is_read) return false;
    if (filterRead === 'unread' && contact.is_read) return false;

    return true;
  }) || [];

  const unreadCount = contacts?.filter((c) => !c.is_read).length || 0;

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelectContact = (id: number) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
          <p className="text-gray-600">Manage contact inquiries from potential clients</p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-blue-600 text-white">
            {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
          </Badge>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterRead === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterRead('all')}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant={filterRead === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilterRead('unread')}
              className="flex-1"
            >
              Unread
            </Button>
            <Button
              variant={filterRead === 'read' ? 'default' : 'outline'}
              onClick={() => setFilterRead('read')}
              className="flex-1"
            >
              Read
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-900">
              {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkMarkAsRead}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Read
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedContacts([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Contacts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No contacts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-lg shadow p-6 ${
                !contact.is_read ? 'border-l-4 border-blue-600' : ''
              } ${selectedContacts.includes(contact.id) ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => toggleSelectContact(contact.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                        {!contact.is_read && (
                          <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                            {contact.email}
                          </a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(contact.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {!contact.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(contact.id)}
                        className="ml-4"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{contact.subject}</span>
                    </div>
                    <div className="bg-gray-50 rounded p-4 mt-2">
                      <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
