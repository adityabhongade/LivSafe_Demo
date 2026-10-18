import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building2, Save, User } from 'lucide-react';
import { organizationAPI } from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  type: z.string().min(1, 'Organization type is required'),
});

export default function OrganizationProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      type: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await organizationAPI.getCurrentUser();
        
        if (profileData) {
          form.reset({
            name: profileData.fullName || profileData.name || '',
            email: profileData.email || '',
            type: profileData.type || 'hospital',
          });
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load profile',
          description: error.message || 'Could not load organization profile',
          className:'text-white'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      setIsSaving(true);
      await organizationAPI.updateOrganization(user?.id || '', values);
      toast({ title: 'Profile updated successfully', description: 'Your organization profile has been updated.', className:'text-white' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to update profile', description: error.message || 'Could not update organization profile', className:'text-white' });
    } finally {
      setIsSaving(false);
    }
  };

  // Inline autosave (debounced)
  useEffect(() => {
    const sub = form.watch(async (vals, { name, type }) => {
      if (type !== 'change') return;
      const valid = await form.trigger(name as any, { shouldFocus: false });
      if (!valid) return;
      const handler = setTimeout(async () => {
        try {
          await organizationAPI.updateOrganization(user?.id || '', vals as any);
          const badge = document.getElementById('saved-badge');
          if (badge) { badge.classList.remove('opacity-0'); setTimeout(() => badge.classList.add('opacity-0'), 1200); }
        } catch {}
      }, 800);
      return () => clearTimeout(handler);
    });
    return () => sub.unsubscribe();
  }, [form, user?.id]);

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="organization" showAuthButtons={false} />
        <section className="py-12 bg-primary-800">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center text-white text-xl">Loading profile...</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="organization" showAuthButtons={false} />

      <section className="py-12 bg-primary-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/organization/dashboard">
              <span className="inline-flex items-center text-primary-300 hover:text-white transition cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white mt-4">Organization Profile</h1>
              <span id="saved-badge" className="mt-4 text-sm text-green-400 transition-opacity opacity-0">Saved ✓</span>
            </div>
            <p className="text-primary-300 mt-2">
              Manage your organization's information and settings
            </p>
          </div>

          <div className="bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Organization Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="organization-name"
                            name="organization-name"
                            placeholder="Enter organization name"
                            className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-primary-600 text-black focus:ring-accent placeholder-gray-500"
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="organization@example.com"
                            className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-primary-600 text-black focus:ring-accent placeholder-gray-500"
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">Organization Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-primary-600 text-black focus:ring-accent">
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-primary-600">
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="clinic">Clinic</SelectItem>
                          <SelectItem value="research">Research Institute</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="bg-primary-800 rounded-lg p-4 border border-primary-600">
                  <h4 className="text-sm font-medium text-primary-100 mb-2 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Account Information
                  </h4>
                  <div className="text-xs text-primary-300 space-y-1">
                    <p>• Organization ID: {user?.id || 'N/A'}</p>
                    <p>• Account Type: {form.watch('type') ? form.watch('type').charAt(0).toUpperCase() + form.watch('type').slice(1) : 'Organization'}</p>
                    <p>• Member Since: {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/organization/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-primary-600 text-primary-100 hover:bg-primary-600"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-accent hover:bg-accent/90 text-white"
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
