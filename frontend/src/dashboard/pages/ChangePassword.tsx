import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Key, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardApi } from '../services/dashboardApi';
import { getDashboardRoute } from '../utils/roleUtils';

export const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout, checkAuth, login } = useAuth();
  const navigate = useNavigate();

  const mustChangePassword = user?.must_change_password || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await dashboardApi.changePassword(
        mustChangePassword ? null : oldPassword,
        newPassword,
        confirmPassword
      );

      if (response.success) {
        toast.success('Password changed successfully!');
        
        // If this was a temporary password change, redirect to role-based dashboard
        if (response.redirect_to_dashboard) {
          // Update user data if provided in response
          if (response.user) {
            login(response.user);
          } else {
            // Refresh user data to get updated must_change_password status
            await checkAuth();
          }
          // Redirect to role-based dashboard
          const dashboardRoute = response.dashboard_route || getDashboardRoute(user);
          navigate(dashboardRoute);
        } else {
          // For regular password changes, logout and redirect to login
          await logout();
          navigate('/admin/login');
        }
      } else {
        toast.error(response.error || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mustChangePassword ? 'Change Your Password' : 'Update Password'}
          </h1>
          <p className="text-gray-600">
            {mustChangePassword
              ? 'You must change your temporary password before accessing the dashboard'
              : 'Update your password to keep your account secure'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!mustChangePassword && (
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required={!mustChangePassword}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your current password"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your new password (min. 8 characters)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Changing password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>

        {mustChangePassword && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> You received a temporary password via email. After changing your password, you'll be redirected to the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

