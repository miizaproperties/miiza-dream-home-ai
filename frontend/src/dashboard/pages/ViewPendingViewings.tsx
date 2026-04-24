import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, User, CheckCircle, XCircle, Search, Grid3X3, List, Trash2, CheckSquare, Square, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { API_BASE_URL } from '../../config/api';

interface ViewingRequest {
  id: number;
  contact: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  property: number | null;
  property_title: string | null;
  property_location: string | null;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reference_number: string;
  created_at: string;
}

const fetchViewingRequests = async (status?: string): Promise<ViewingRequest[]> => {
  const url = new URL(`${API_BASE_URL}/contacts/viewing-requests/`);
  if (status && status !== 'all') {
    url.searchParams.append('status', status);
  }
  const response = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return Array.isArray(data) ? data : (data.results || []);
};

const updateViewingStatus = async (id: number, status: string) => {
  const response = await fetch(`${API_BASE_URL}/contacts/viewing-requests/${id}/`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
};

const deleteViewingRequest = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/contacts/viewing-requests/${id}/`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete viewing request');
};

const bulkUpdateViewingStatus = async (ids: number[], status: string) => {
  const promises = ids.map(id => updateViewingStatus(id, status));
  await Promise.all(promises);
};

const bulkDeleteViewingRequests = async (ids: number[]) => {
  const promises = ids.map(id => deleteViewingRequest(id));
  await Promise.all(promises);
};

export const ViewPendingViewings: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedViewings, setSelectedViewings] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: viewings, isLoading } = useQuery({
    queryKey: ['viewing-requests', statusFilter],
    queryFn: () => fetchViewingRequests(statusFilter === 'all' ? undefined : statusFilter),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateViewingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Viewing status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update viewing status');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: string }) =>
      bulkUpdateViewingStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      setSelectedViewings([]);
      toast.success('Viewing requests updated successfully');
    },
    onError: () => {
      toast.error('Failed to update viewing requests');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => bulkDeleteViewingRequests(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      setSelectedViewings([]);
      toast.success('Viewing requests deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete viewing requests');
    },
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleBulkStatusChange = (status: string) => {
    if (selectedViewings.length === 0) return;
    bulkUpdateMutation.mutate({ ids: selectedViewings, status });
  };

  const handleBulkDelete = () => {
    if (selectedViewings.length === 0) return;
    setDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedViewings);
  };

  const filteredViewings = viewings?.filter((viewing) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      viewing.contact.name.toLowerCase().includes(search) ||
      viewing.contact.email.toLowerCase().includes(search) ||
      (viewing.property_title && viewing.property_title.toLowerCase().includes(search)) ||
      viewing.reference_number.toLowerCase().includes(search)
    );
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Group viewings by date for calendar view
  const viewingsByDate = filteredViewings.reduce((acc, viewing) => {
    const date = new Date(viewing.preferred_date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(viewing);
    return acc;
  }, {} as Record<string, ViewingRequest[]>);

  const calendarDates = Object.keys(viewingsByDate).sort();
  const today = new Date().toISOString().split('T')[0];

  const toggleSelectAll = () => {
    if (selectedViewings.length === filteredViewings.length) {
      setSelectedViewings([]);
    } else {
      setSelectedViewings(filteredViewings.map(v => v.id));
    }
  };

  const toggleSelectViewing = (id: number) => {
    setSelectedViewings(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Viewing Requests</h1>
          <p className="text-gray-600">Manage property viewing requests from potential clients</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, property, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedViewings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-900">
              {selectedViewings.length} viewing{selectedViewings.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('pending')}>
                  Set to Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('confirmed')}>
                  Set to Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('completed')}>
                  Set to Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('cancelled')}>
                  Set to Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              onClick={() => setSelectedViewings([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Viewing Requests */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredViewings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No viewing requests found</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredViewings.map((viewing) => (
            <div
              key={viewing.id}
              className={`bg-white rounded-lg shadow p-6 ${selectedViewings.includes(viewing.id) ? 'border-2 border-blue-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedViewings.includes(viewing.id)}
                  onCheckedChange={() => toggleSelectViewing(viewing.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{viewing.property_title || 'General Viewing'}</h3>
                          <p className="text-sm text-gray-500">Reference: {viewing.reference_number}</p>
                        </div>
                        {getStatusBadge(viewing.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{viewing.contact.name}</p>
                            <p className="text-gray-500">{viewing.contact.email}</p>
                            {viewing.contact.phone && (
                              <p className="text-gray-500">{viewing.contact.phone}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {new Date(viewing.preferred_date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {viewing.preferred_time}
                            </p>
                          </div>
                        </div>
                      </div>

                      {viewing.message && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-700">{viewing.message}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        Requested: {new Date(viewing.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:w-48">
                      {viewing.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(viewing.id, 'confirmed')}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(viewing.id, 'cancelled')}
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {viewing.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(viewing.id, 'completed')}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      {viewing.status === 'completed' && (
                        <p className="text-sm text-green-600 font-medium text-center">Completed</p>
                      )}
                      {viewing.status === 'cancelled' && (
                        <p className="text-sm text-red-600 font-medium text-center">Cancelled</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Calendar View</h2>
          <div className="space-y-6">
            {calendarDates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No viewings scheduled</p>
            ) : (
              calendarDates.map((date) => {
                const isPast = date < today;
                const isToday = date === today;
                return (
                  <div key={date} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`px-4 py-2 rounded-lg ${
                        isToday ? 'bg-blue-600 text-white' :
                        isPast ? 'bg-gray-200 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <div className="text-sm font-medium">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {viewingsByDate[date].length} viewing{viewingsByDate[date].length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viewingsByDate[date].map((viewing) => (
                        <div
                          key={viewing.id}
                          className={`border rounded-lg p-4 ${
                            viewing.status === 'confirmed' ? 'border-blue-300 bg-blue-50' :
                            viewing.status === 'completed' ? 'border-green-300 bg-green-50' :
                            viewing.status === 'cancelled' ? 'border-red-300 bg-red-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{viewing.property_title || 'General Viewing'}</h4>
                              {viewing.property_location && (
                                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {viewing.property_location}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(viewing.status)}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600 mb-3">
                            <p><strong>Client:</strong> {viewing.contact.name}</p>
                            <p><strong>Time:</strong> {viewing.preferred_time}</p>
                            <p><strong>Ref:</strong> {viewing.reference_number}</p>
                          </div>
                          <div className="flex gap-2">
                            {viewing.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs h-7"
                                  onClick={() => handleStatusChange(viewing.id, 'confirmed')}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs h-7"
                                  onClick={() => handleStatusChange(viewing.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {viewing.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs h-7"
                                onClick={() => handleStatusChange(viewing.id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedViewings.length} viewing request{selectedViewings.length > 1 ? 's' : ''}. This action cannot be undone.
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
