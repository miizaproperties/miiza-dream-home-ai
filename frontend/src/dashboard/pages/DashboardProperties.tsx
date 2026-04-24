import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Search, Trash2, Edit, CheckSquare, Square, Filter, X } from 'lucide-react';
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

interface Property {
  id: number;
  title: string;
  property_type: string;
  status: string;
  development_type?: string;
  city: string;
  country: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  display_price: string;
  featured: boolean;
  created_at: string;
}

interface Filters {
  search: string;
  property_type: string;
  status: string;
  city: string;
  country: string;
  min_price: string;
  max_price: string;
  featured: string;
  date_from: string;
  date_to: string;
}

import { API_BASE_URL, DASHBOARD_API_BASE_URL } from '../../config/api';

const fetchProperties = async (filters: Filters): Promise<Property[]> => {
  const url = new URL(`${API_BASE_URL}/properties/`);
  
  if (filters.search && filters.search.trim()) {
    url.searchParams.append('search', filters.search.trim());
  }
  if (filters.property_type && filters.property_type !== 'all') {
    url.searchParams.append('property_type', filters.property_type);
  }
  if (filters.status && filters.status !== 'all') {
    url.searchParams.append('status', filters.status);
  }
  if (filters.city && filters.city.trim()) {
    url.searchParams.append('city', filters.city.trim());
  }
  if (filters.country && filters.country.trim()) {
    url.searchParams.append('country', filters.country.trim());
  }
  if (filters.min_price && filters.min_price.trim()) {
    url.searchParams.append('min_price', filters.min_price);
  }
  if (filters.max_price && filters.max_price.trim()) {
    url.searchParams.append('max_price', filters.max_price);
  }
  if (filters.featured && filters.featured !== 'all') {
    url.searchParams.append('featured', filters.featured === 'true' ? 'true' : 'false');
  }
  
  const response = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.statusText}`);
  }
  
  const data = await response.json();
  let properties = Array.isArray(data) ? data : (data.results || []);
  
  // Filter by date range if provided
  if (filters.date_from || filters.date_to) {
    properties = properties.filter((prop: Property) => {
      const createdDate = new Date(prop.created_at);
      if (filters.date_from && createdDate < new Date(filters.date_from)) return false;
      if (filters.date_to) {
        const toDate = new Date(filters.date_to);
        toDate.setHours(23, 59, 59, 999);
        if (createdDate > toDate) return false;
      }
      return true;
    });
  }
  
  return properties;
};

const deleteProperty = async (id: number) => {
  const response = await fetch(`${DASHBOARD_API_BASE_URL}/properties/${id}/delete/`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete property' }));
    throw new Error(errorData.error || 'Failed to delete property');
  }
};

const bulkUpdateProperties = async (ids: number[], updates: Partial<Property>) => {
  const promises = ids.map(id =>
    fetch(`${DASHBOARD_API_BASE_URL}/properties/${id}/update/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  );
  const results = await Promise.all(promises);
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    const errorMessages = await Promise.all(
      failed.map(async (r) => {
        try {
          const errorData = await r.json();
          return errorData.error || r.statusText;
        } catch {
          return r.statusText;
        }
      })
    );
    throw new Error(`Failed to update ${failed.length} properties: ${errorMessages.join(', ')}`);
  }
};

export const DashboardProperties: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    property_type: 'all',
    status: 'all',
    city: '',
    country: '',
    min_price: '',
    max_price: '',
    featured: 'all',
    date_from: '',
    date_to: '',
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ['dashboard', 'properties', filters],
    queryFn: () => fetchProperties(filters),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Property deleted successfully');
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete property');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updates }: { ids: number[]; updates: Partial<Property> }) =>
      bulkUpdateProperties(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      setSelectedProperties([]);
      toast.success('Properties updated successfully');
    },
    onError: () => {
      toast.error('Failed to update properties');
    },
  });

  const handleDelete = (id: number) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      deleteMutation.mutate(propertyToDelete);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProperties.length === 0) return;
    setPropertyToDelete(selectedProperties[0]);
    setDeleteDialogOpen(true);
  };

  const handleBulkStatusChange = (status: string) => {
    if (selectedProperties.length === 0) return;
    bulkUpdateMutation.mutate({
      ids: selectedProperties,
      updates: { status },
    });
  };

  const handleBulkFeaturedToggle = (featured: boolean) => {
    if (selectedProperties.length === 0) return;
    bulkUpdateMutation.mutate({
      ids: selectedProperties,
      updates: { featured },
    });
  };

  const toggleSelectAll = () => {
    if (selectedProperties.length === properties?.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties?.map(p => p.id) || []);
    }
  };

  const toggleSelectProperty = (id: number) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      property_type: 'all',
      status: 'all',
      city: '',
      country: '',
      min_price: '',
      max_price: '',
      featured: 'all',
      date_from: '',
      date_to: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    v => v !== '' && v !== 'all'
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
          <p className="text-gray-600">Manage all property listings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-1 bg-blue-600 text-white">{Object.values(filters).filter(v => v !== '' && v !== 'all').length}</Badge>
            )}
          </Button>
          <Button
            onClick={() => navigate('/admin/properties/add')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Add New Property
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Property Type</label>
              <Select
                value={filters.property_type}
                onValueChange={(value) => setFilters({ ...filters, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="traditional_home">Traditional Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">City</label>
              <Input
                placeholder="Filter by city"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Country</label>
              <Input
                placeholder="Filter by country"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Min Price</label>
              <Input
                type="number"
                placeholder="Minimum price"
                value={filters.min_price}
                onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Max Price</label>
              <Input
                type="number"
                placeholder="Maximum price"
                value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Featured</label>
              <Select
                value={filters.featured}
                onValueChange={(value) => setFilters({ ...filters, featured: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Featured Only</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Date From</label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Date To</label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-900">
              {selectedProperties.length} property{selectedProperties.length > 1 ? 'ies' : 'y'} selected
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
                <DropdownMenuItem onClick={() => handleBulkStatusChange('available')}>
                  Set to Available
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('sold')}>
                  Set to Sold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('rented')}>
                  Set to Rented
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('pending')}>
                  Set to Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('development')}>
                  Set to Development
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkFeaturedToggle(true)}
            >
              Mark Featured
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkFeaturedToggle(false)}
            >
              Unmark Featured
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
              onClick={() => setSelectedProperties([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : properties?.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No properties found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <Checkbox
                      checked={selectedProperties.length === properties?.length && properties.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Development Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties?.map((property: Property) => (
                  <tr
                    key={property.id}
                    className={`hover:bg-gray-50 ${selectedProperties.includes(property.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={() => toggleSelectProperty(property.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {property.title}
                            {property.featured && (
                              <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.bedrooms} bed, {property.bathrooms} bath
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {property.property_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.location || `${property.city}, ${property.country}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={property.status}
                        onValueChange={(value) => {
                          bulkUpdateMutation.mutate({
                            ids: [property.id],
                            updates: { status: value },
                          });
                        }}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.status === 'development' && property.development_type ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 capitalize">
                          {property.development_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {property.display_price || `KSh ${property.price}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/properties/edit/${property.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(property.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProperties.length > 1
                ? `This will permanently delete ${selectedProperties.length} properties. This action cannot be undone.`
                : 'This will permanently delete this property. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProperties.length > 1) {
                  // Bulk delete
                  Promise.all(selectedProperties.map(id => deleteProperty(id)))
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['dashboard', 'properties'] });
                      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
                      setSelectedProperties([]);
                      toast.success(`${selectedProperties.length} properties deleted successfully`);
                      setDeleteDialogOpen(false);
                    })
                    .catch(() => {
                      toast.error('Failed to delete some properties');
                    });
                } else {
                  confirmDelete();
                }
              }}
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
