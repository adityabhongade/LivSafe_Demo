import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';
import { sitePath } from '@/lib/utils';
import LoadingDots from '@/components/ui/LoadingDots';

const schema = z.object({
  role: z.enum(['doctor', 'organization']),
  fullName: z.string().min(2, 'Name is required').optional(),
  specialty: z.string().max(50).optional(),
  orgName: z.string().min(2, 'Organization name is required').optional(),
  email: z.string().email('Valid email required').optional(),
  password: z.string().min(6, 'Min 6 chars').optional(),
}).refine(v => (v.role === 'doctor' ? !!v.fullName : !!v.orgName), {
  message: 'Please fill the required fields',
  path: ['role'],
});

type FormValues = z.infer<typeof schema>;

export default function CompleteProfile() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'doctor' },
    mode: 'onChange',
  });

  const role = form.watch('role');
  const needsDoctor = role === 'doctor';

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = {
        role: values.role,
        fullName: values.fullName,
        specialty: values.specialty,
        orgName: values.orgName,
        email: values.email,
        password: values.password,
      };
      const res = await authAPI.completeOAuthProfile(payload);
      if (res?.data?.type === 'organization') {
        window.location.href = sitePath('organization/dashboard');
      } else {
        window.location.href = sitePath('doctor/dashboard');
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save failed', description: e.message || 'Please try again', className: 'text-white' });
    } finally {
      setSubmitting(false);
    }
  }

  // When submit fails, add shake
  const onInvalid = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className={`auth-panel w-full max-w-xl p-8 ${shake ? 'shake-on-error' : ''}`}>
        <h1 className="text-2xl font-bold text-white mb-2">Complete your profile</h1>
        <p className="text-primary-300 mb-6">Link your Google sign-in to a doctor or organization account.</p>

        {/* Progress bar on submit */}
        {submitting && (
          <div className="h-1 w-full bg-primary-700 rounded overflow-hidden mb-4">
            <div className="h-full w-3/4 bg-accent animate-pulse" />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant={role === 'doctor' ? undefined : 'outline'} className={`${role==='doctor'?'bg-accent':''}`} onClick={() => form.setValue('role','doctor')}>Doctor</Button>
              <Button type="button" variant={role === 'organization' ? undefined : 'outline'} className={`${role==='organization'?'bg-accent':''}`} onClick={() => form.setValue('role','organization')}>Organization</Button>
            </div>

            {needsDoctor ? (
              <>
                <FormField name="fullName" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Doctor full name</FormLabel>
                    <FormControl><Input {...field} className="bg-white text-black" placeholder="Dr. Jane Doe"/></FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )} />
                <FormField name="specialty" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Specialty (optional)</FormLabel>
                    <FormControl><Input {...field} className="bg-white text-black" placeholder="Hepatology"/></FormControl>
                  </FormItem>
                )} />
              </>
            ) : (
              <FormField name="orgName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Organization name</FormLabel>
                  <FormControl><Input {...field} className="bg-white text-black" placeholder="City Hospital"/></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
            )}

            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl><Input {...field} className="bg-white text-black" placeholder="you@example.com"/></FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password (optional)</FormLabel>
                <FormControl><Input {...field} type="password" className="bg-white text-black" placeholder="Create a password for email login later"/></FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

<Button type="submit" className="w-full bg-accent text-white" disabled={submitting}>{submitting ? (<><span>Saving</span> <span className="ml-2"><LoadingDots /></span></>) : 'Save & continue'}</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
