import { useState } from 'react';
import { Link, useLocation } from 'wouter';
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
import LoadingDots from '@/components/ui/LoadingDots';
import { Sparkles, KeyRound } from 'lucide-react';

const formSchema = z.object({
  email: z.string().min(1, 'Username or email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'user01',
      password: 'user_pass1',
    },
  });

  const handleFillDemo = () => {
    form.setValue('email', 'user01');
    form.setValue('password', 'user_pass1');
    toast({
      title: 'Demo credentials loaded',
      description: 'Username: user01 | Password: user_pass1',
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast({
          title: 'Login successful',
          description: 'Welcome to the LivSafe interactive demo!',
          className: 'text-white'
        });
        // AuthContext handles redirect to /doctor/dashboard
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid credentials. Demo auth: user01 / user_pass1',
          className: 'text-white'
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error?.message || 'For this demo, use: user01 / user_pass1',
        className: 'text-white'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-12 rounded-t-3xl mt-8 bg-gradient-to-br from-violet-800 to-purple-900">
        <div className="max-w-md mx-auto px-6">
          <div className="auth-panel rounded-2xl p-8 shadow-lg bg-violet-700 border border-violet-600">
            <h2 className="text-2xl font-bold mb-3 text-center text-white">Login to LivSafe Demo</h2>
            <p className="text-sm text-center text-violet-200 mb-6">
              Self-contained liver ultrasound decision-support prototype
            </p>

            {/* Demo Credentials Helper Card */}
            <div className="mb-6 p-4 rounded-xl bg-violet-800/80 border border-violet-500 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                  <Sparkles size={16} />
                  Demo Access Credentials
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillDemo}
                  className="h-7 text-xs bg-violet-900/60 border-violet-400 text-violet-100 hover:bg-violet-900 hover:text-white"
                >
                  <KeyRound size={12} className="mr-1" />
                  Auto-fill
                </Button>
              </div>
              <div className="space-y-1 text-xs text-violet-200 font-mono">
                <div>Username: <span className="text-white font-bold">user01</span></div>
                <div>Password: <span className="text-white font-bold">user_pass1</span></div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-violet-100">Username or Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="user01 or doctor@example.com"
                          className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-violet-600 text-black focus:ring-violet-400 placeholder-gray-500"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-violet-100">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="user_pass1"
                          type="password"
                          className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none bg-white border border-violet-600 text-black focus:ring-violet-400 placeholder-gray-500"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full font-medium py-6 mt-4 bg-gradient-to-r from-accent to-accent text-white hover:from-accent/90 hover:to-accent/90 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (<><span>Logging in</span> <span className="ml-2"><LoadingDots /></span></>) : 'Sign In as Doctor'}
                </Button>

                <div className="mt-6 text-center text-sm text-violet-300">
                  Want to explore without credentials?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('email', 'user01');
                      form.setValue('password', 'user_pass1');
                      form.handleSubmit(onSubmit)();
                    }}
                    className="font-medium text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                  >
                    Click here to Launch Demo Instantly
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
