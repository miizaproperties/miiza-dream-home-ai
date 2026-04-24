import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { API_BASE_URL, DASHBOARD_API_BASE_URL } from '../../config/api';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_agent: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<UserFormData>({
    defaultValues: {
      is_agent: false,
      is_staff: false,
      is_superuser: false,
    },
  });

  const isAgent = watch('is_agent');
  const isStaff = watch('is_staff');
  const isSuperuser = watch('is_superuser');

  useEffect(() => {
    if (!id) {
      toast.error('User ID is missing.');
      navigate('/admin/users');
      return;
    }

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/accounts/users/${id}/`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const user = await response.json();

        // Populate form
        reset({
          username: user.username || '',
          email: user.email || '',
          password: '', // Don't populate password
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone_number: user.phone_number || '',
          is_agent: user.is_agent || false,
          is_staff: user.is_staff || false,
          is_superuser: user.is_superuser || false,
        });
      } catch (error) {
        toast.error('Failed to load user data.');
        console.error('Error fetching user:', error);
        navigate('/admin/users');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [id, navigate, reset]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      // Only include password if it's provided
      const updateData: any = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(`${DASHBOARD_API_BASE_URL}/users/${id}/update/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('User updated successfully!');
        navigate('/admin/users');
      } else {
        toast.error(result.error || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${DASHBOARD_API_BASE_URL}/users/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('User deleted successfully!');
        navigate('/admin/users');
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600">Modify user account information</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              {...register('username', { required: 'Username is required' })}
              placeholder="Enter username"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="Enter email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...register('last_name')}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            {...register('phone_number')}
            placeholder="+254 700 000 000"
          />
        </div>

        <div>
          <Label htmlFor="password">New Password (leave blank to keep current)</Label>
          <Input
            id="password"
            type="password"
            {...register('password', {
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            placeholder="Enter new password (optional)"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Permissions */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Permissions & Roles</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_agent"
                checked={isAgent}
                onCheckedChange={(checked) => setValue('is_agent', checked as boolean)}
              />
              <Label htmlFor="is_agent" className="cursor-pointer">
                Is Agent
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_staff"
                checked={isStaff}
                onCheckedChange={(checked) => setValue('is_staff', checked as boolean)}
              />
              <Label htmlFor="is_staff" className="cursor-pointer">
                Is Staff (Can access admin dashboard)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_superuser"
                checked={isSuperuser}
                onCheckedChange={(checked) => setValue('is_superuser', checked as boolean)}
              />
              <Label htmlFor="is_superuser" className="cursor-pointer">
                Is Superuser (Full admin access)
              </Label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/users')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </span>
            ) : (
              <span className="flex items-center">
                <User className="mr-2 h-4 w-4" /> Update User
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

