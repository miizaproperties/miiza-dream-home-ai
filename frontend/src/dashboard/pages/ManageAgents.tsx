import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { UserPlus, Edit, Trash2, Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { API_BASE_URL, DASHBOARD_API_BASE_URL } from '../../config/api';

interface Agent {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  license_number: string;
  years_experience: number;
  specialization: string;
}

interface AgentFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  license_number: string;
  years_experience: number;
  specialization: string;
}

const fetchAgents = async (): Promise<Agent[]> => {
  const response = await fetch(`${API_BASE_URL}/accounts/agents/`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return Array.isArray(data) ? data : (data.results || []);
};

const createAgent = async (formData: AgentFormData) => {
  const response = await fetch(`${DASHBOARD_API_BASE_URL}/agents/create/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create agent');
  }
  return response.json();
};

const updateAgent = async (id: number, formData: Partial<AgentFormData>) => {
  const response = await fetch(`${DASHBOARD_API_BASE_URL}/agents/${id}/update/`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update agent');
  }
  return response.json();
};

const deleteAgent = async (id: number) => {
  const response = await fetch(`${DASHBOARD_API_BASE_URL}/agents/${id}/delete/`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete agent' }));
    throw new Error(error.error || `Failed to delete agent: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const ManageAgents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const queryClient = useQueryClient();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AgentFormData>({
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      license_number: '',
      years_experience: 0,
      specialization: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent created successfully');
      reset();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AgentFormData> }) => updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent updated successfully');
      reset();
      setIsDialogOpen(false);
      setEditingAgent(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete agent');
    },
  });

  const onSubmit = (data: AgentFormData) => {
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setValue('username', agent.user.username);
    setValue('email', agent.user.email);
    setValue('first_name', agent.user.first_name || '');
    setValue('last_name', agent.user.last_name || '');
    setValue('phone_number', agent.user.phone_number || '');
    setValue('license_number', agent.license_number || '');
    setValue('years_experience', agent.years_experience || 0);
    setValue('specialization', agent.specialization || '');
    setValue('password', ''); // Don't pre-fill password
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingAgent(null);
    reset();
    setIsDialogOpen(true);
  };

  const filteredAgents = agents?.filter((agent) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      agent.user.username.toLowerCase().includes(search) ||
      agent.user.email.toLowerCase().includes(search) ||
      `${agent.user.first_name} ${agent.user.last_name}`.toLowerCase().includes(search) ||
      agent.specialization.toLowerCase().includes(search)
    );
  }) || [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Agents</h1>
          <p className="text-gray-600">View and manage real estate agents</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...register('username', { required: 'Username is required' })}
                    disabled={!!editingAgent}
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" {...register('first_name')} />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" {...register('last_name')} />
                </div>
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" {...register('phone_number')} />
              </div>

              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input id="license_number" {...register('license_number')} />
              </div>

              <div>
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  {...register('years_experience', { valueAsNumber: true, min: 0 })}
                />
              </div>

              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Textarea
                  id="specialization"
                  {...register('specialization')}
                  placeholder="e.g., Residential, Commercial, Luxury Properties"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search agents by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Agents List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No agents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agent.user.first_name && agent.user.last_name
                      ? `${agent.user.first_name} ${agent.user.last_name}`
                      : agent.user.username}
                  </h3>
                  <p className="text-sm text-gray-500">{agent.user.email}</p>
                  {agent.user.phone_number && (
                    <p className="text-sm text-gray-500">{agent.user.phone_number}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {agent.license_number && (
                  <div className="text-sm">
                    <span className="text-gray-500">License:</span>{' '}
                    <span className="font-medium">{agent.license_number}</span>
                  </div>
                )}
                {agent.years_experience > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">Experience:</span>{' '}
                    <span className="font-medium">{agent.years_experience} years</span>
                  </div>
                )}
                {agent.specialization && (
                  <div className="text-sm">
                    <span className="text-gray-500">Specialization:</span>{' '}
                    <span className="font-medium">{agent.specialization}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(agent)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this agent?')) {
                      deleteMutation.mutate(agent.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

