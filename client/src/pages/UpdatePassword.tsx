import { useState } from 'react';
import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { authAPI } from '@/lib/api';

const formSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export default function UpdatePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await authAPI.updatePassword(values.currentPassword, values.newPassword);
      
      toast({
        title: 'Password updated successfully',
        description: 'Your password has been changed. You will be redirected to the dashboard.',
      });

      // Reset form
      form.reset();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        if (user?.type === 'organization') {
          window.location.href = '/organization/dashboard';
        } else {
          window.location.href = '/doctor/dashboard';
        }
      }, 2000);
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password update failed',
        description: error.message || 'An error occurred while updating your password',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType={user?.type || 'doctor'} showAuthButtons={false} />

      <section className="py-12 bg-primary-800">
        <div className="max-w-md mx-auto px-6">
          <div className="mb-8">
            <Link href={user?.type === 'organization' ? '/organization/dashboard' : '/doctor/dashboard'}>
              <span className="inline-flex items-center text-primary-300 hover:text-white transition cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Update Password</h1>
            <p className="text-primary-300 mt-2">
              Change your password to keep your account secure
            </p>
          </div>

          <div className="bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter your current password"
                            className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-primary-600 text-black focus:ring-accent placeholder-gray-500 pr-10"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-primary-600 text-black focus:ring-accent placeholder-gray-500 pr-10"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your new password"
                            className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-primary-600 text-black focus:ring-accent placeholder-gray-500 pr-10"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="bg-primary-800 rounded-lg p-4 border border-primary-600">
                  <h4 className="text-sm font-medium text-primary-100 mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-primary-300 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Must be different from your current password</li>
                    <li>• Should be unique and secure</li>
                    <li>• Use a combination of letters, numbers, and symbols</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full font-medium py-6 mt-6 bg-gradient-to-r from-accent to-accent text-white hover:from-accent/90 hover:to-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
