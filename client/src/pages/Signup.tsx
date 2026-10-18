import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
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
import { authAPI } from '@/lib/api';

// Doctor form validation schema
const doctorFormSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  specialization: z.string().min(1, 'Please select a specialization'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Organization form validation schema
const organizationFormSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  email: z.string().email('Invalid email address'),
  type: z.string().min(1, 'Please select organization type'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type DoctorFormData = z.infer<typeof doctorFormSchema>;
type OrganizationFormData = z.infer<typeof organizationFormSchema>;

export default function Signup() {
  const [accountType, setAccountType] = useState<'doctor' | 'organization'>('doctor');
  const [isDoctorLoading, setIsDoctorLoading] = useState(false);
  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Doctor form setup
  const doctorForm = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      specialization: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // Organization form setup
  const organizationForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      email: '',
      type: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // Reset forms when switching account types
  const handleAccountTypeChange = (type: 'doctor' | 'organization') => {
    setAccountType(type);
    doctorForm.reset();
    organizationForm.reset();
    setIsDoctorLoading(false); // ✅ reset loading states
    setIsOrgLoading(false);    // ✅ reset loading states
  };

  // Doctor form submission
  const onDoctorSubmit = async (values: DoctorFormData) => {
    setIsDoctorLoading(true);
    try {
      await authAPI.signupDoctor({
        fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim().toLowerCase(),
        specialty: values.specialization,
        password: values.password,
      });

      toast({
        title: 'Success!',
        description: 'Your doctor account has been created successfully.',
        className: 'text-white', 
      });
      
      setLocation('/login');
    } catch (error: any) {
      console.error('Doctor signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An error occurred during signup. Please try again.',
        className: 'text-white',
      });
    } finally {
      setIsDoctorLoading(false);
    }
  };

  // Organization form submission
  const onOrganizationSubmit = async (values: OrganizationFormData) => {
    setIsOrgLoading(true);
    try {
      await authAPI.signupOrganization({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        type: values.type,
      });

      toast({
        title: 'Success!',
        description: 'Your organization account has been created successfully.',
        className: 'text-white',
      });
      
      setLocation('/login');
    } catch (error: any) {
      console.error('Organization signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An error occurred during signup. Please try again.',
        className: 'text-white',
      });
    } finally {
      setIsOrgLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <section id="signup" className="py-12 bg-primary-700">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-primary-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Create Your Account</h2>

            <div className="flex items-center justify-center mb-8">
              <div className="flex p-1 bg-primary-900 rounded-lg">
                <button
                  onClick={() => handleAccountTypeChange('doctor')}
                  className={`px-6 py-2.5 rounded-lg font-medium ${
                    accountType === 'doctor'
                      ? 'bg-accent text-white'
                      : 'text-primary-200 hover:bg-primary-700'
                  }`}
                  type="button"
                >
                  Doctor
                </button>
                <button
                  onClick={() => handleAccountTypeChange('organization')}
                  className={`px-6 py-2.5 rounded-lg font-medium ${
                    accountType === 'organization'
                      ? 'bg-accent text-white'
                      : 'text-primary-200 hover:bg-primary-700'
                  }`}
                  type="button"
                >
                  Organization
                </button>
              </div>
            </div>

            {accountType === 'doctor' ? (
              <Form {...doctorForm}>
                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField
                      control={doctorForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="bg-white border border-primary-600 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                              disabled={isDoctorLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={doctorForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="bg-white border border-primary-600 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                              disabled={isDoctorLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={doctorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="doctor@hospital.com"
                            className="bg-white border border-primary-600 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            disabled={isDoctorLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={doctorForm.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Specialization</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isDoctorLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-primary-900 border border-primary-600 rounded-xl bg-white text-black">
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black border border-primary-600 text-white">
                            <SelectItem value="radiology">Radiology</SelectItem>
                            <SelectItem value="hepatology">Hepatology</SelectItem>
                            <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                            <SelectItem value="internal">Internal Medicine</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField
                      control={doctorForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="bg-white border border-primary-600 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                              disabled={isDoctorLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={doctorForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="bg-white border border-primary-600 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                              disabled={isDoctorLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-accent to-accent text-white font-medium py-6 mt-6"
                    disabled={isDoctorLoading}
                  >
                    {isDoctorLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <form onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)} className="space-y-5">
                  {/* Organization Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="org-name" className="block text-sm font-medium text-primary-100">
                      Organization Name
                    </label>
                    <input
                      id="org-name"
                      type="text"
                      placeholder="Enter hospital or clinic name"
                      className="w-full px-4 py-3 rounded-lg border border-primary-600 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isOrgLoading}
                      {...organizationForm.register('name')}
                      autoComplete="organization"
                    />
                    {organizationForm.formState.errors.name && (
                      <p className="text-sm text-red-400 mt-1">
                        {organizationForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Organization Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="org-email" className="block text-sm font-medium text-primary-100">
                      Organization Email
                    </label>
                    <input
                      id="org-email"
                      type="email"
                      placeholder="admin@hospital.com"
                      className="w-full px-4 py-3 rounded-lg border border-primary-600 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isOrgLoading}
                      {...organizationForm.register('email')}
                      autoComplete="email"
                    />
                    {organizationForm.formState.errors.email && (
                      <p className="text-sm text-red-400 mt-1">
                        {organizationForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Organization Type Field */}
                  <div className="space-y-2">
                    <label htmlFor="org-type" className="block text-sm font-medium text-primary-100">
                      Organization Type
                    </label>
                    <select
                      id="org-type"
                      className="w-full px-4 py-3 rounded-lg border border-primary-600 bg-white text-black focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isOrgLoading}
                      {...organizationForm.register('type')}
                    >
                      <option value="" disabled>
                        Select organization type
                      </option>
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="research">Research Institution</option>
                      <option value="other">Other</option>
                    </select>
                    {organizationForm.formState.errors.type && (
                      <p className="text-sm text-red-400 mt-1">
                        {organizationForm.formState.errors.type.message}
                      </p>
                    )}
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="org-password" className="block text-sm font-medium text-primary-100">
                        Password
                      </label>
                      <input
                        id="org-password"
                        type="password"
                        placeholder="Enter secure password"
                        className="w-full px-4 py-3 rounded-lg border border-primary-600 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isOrgLoading}
                        {...organizationForm.register('password')}
                        autoComplete="new-password"
                      />
                      {organizationForm.formState.errors.password && (
                        <p className="text-sm text-red-400 mt-1">
                          {organizationForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="org-confirm-password" className="block text-sm font-medium text-primary-100">
                        Confirm Password
                      </label>
                      <input
                        id="org-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 rounded-lg border border-primary-600 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isOrgLoading}
                        {...organizationForm.register('confirmPassword')}
                        autoComplete="new-password"
                      />
                      {organizationForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-400 mt-1">
                          {organizationForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isOrgLoading || !organizationForm.formState.isValid}
                    className="w-full bg-gradient-to-r from-accent to-accent hover:from-accent/90 hover:to-accent/90 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary-800"
                  >
                    {isOrgLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v8H4z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      'Create Organization Account'
                    )}
                  </button>
                </form>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-primary-300">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-100 font-medium hover:text-white">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
