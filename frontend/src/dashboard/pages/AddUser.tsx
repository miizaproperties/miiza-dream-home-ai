import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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

export const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UserFormData>({
    defaultValues: {
      is_agent: false,
      is_staff: false,
      is_superuser: false,
    },
  });

  const isAgent = watch('is_agent');
  const isStaff = watch('is_staff');
  const isSuperuser = watch('is_superuser');

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${DASHBOARD_API_BASE_URL}/users/create/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('User created successfully!');
        navigate('/admin/users');
      } else {
        toast.error(result.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
          <p className="text-gray-600">Create a new user account</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          Cancel
        </Button>
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
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
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
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            placeholder="Enter password"
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" /> Create User
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

