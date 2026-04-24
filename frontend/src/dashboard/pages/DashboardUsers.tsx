import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '../../config/api';

export const DashboardUsers: React.FC = () => {
  const navigate = useNavigate();
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['dashboard', 'users'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/accounts/users/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      // Handle paginated response
      return Array.isArray(data) ? data : (data.results || []);
    },
  });

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['dashboard', 'agents'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/accounts/agents/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // Handle paginated response
      return Array.isArray(data) ? data : (data.results || []);
    },
  });

  const users = Array.isArray(usersData) ? usersData : [];
  const agents = Array.isArray(agentsData) ? agentsData : [];
  const isLoading = usersLoading || agentsLoading;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users & Agents Management</h1>
        <p className="text-gray-600">Manage user accounts and real estate agents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Users
              </h2>
              <button
                onClick={() => navigate('/admin/users/add')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add User
              </button>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : usersError ? (
              <p className="text-center text-red-500 py-8">Error loading users. Please try again.</p>
            ) : (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                ) : (
                  users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{user.username}</div>
                          {user.is_superuser && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                          {user.is_staff && !user.is_superuser && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {user.is_agent && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Agent
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {(user.first_name || user.last_name) && (
                          <div className="text-xs text-gray-400 mt-1">
                            {user.first_name} {user.last_name}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800 ml-4"
                      >
                        Edit
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Agents Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Agents
              </h2>
              <button
                onClick={() => navigate('/admin/agents')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Manage Agents
              </button>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {agents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No agents found</p>
                ) : (
                  agents.slice(0, 10).map((agent: any) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium">
                        {agent.user?.first_name} {agent.user?.last_name || agent.user?.username}
                      </div>
                      <div className="text-sm text-gray-500">{agent.user?.email}</div>
                      <div className="text-xs text-gray-400 mt-1">{agent.specialization}</div>
                    </div>
                    <button
                      onClick={() => navigate('/admin/agents')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Manage
                    </button>
                  </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

