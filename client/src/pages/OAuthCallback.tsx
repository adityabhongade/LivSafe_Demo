import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function OAuthCallback() {
  const [, setLocation] = useLocation();
  const { handleOAuthCallback } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: error,
        });
        setLocation('/login');
        return;
      }

      if (token) {
        try {
          const success = await handleOAuthCallback(token);
          if (success) {
            toast({
              title: 'Login successful',
              description: 'Welcome back!',
              className: 'text-white',
            });
            // AuthContext will handle redirect based on user type
          } else {
            toast({
              variant: 'destructive',
              title: 'Login failed',
              description: 'Failed to process OAuth login',
            });
            setLocation('/login');
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Login failed',
            description: 'An error occurred during OAuth login',
          });
          setLocation('/login');
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'No token received from OAuth provider',
        });
        setLocation('/login');
      }
    };

    handleCallback();
  }, [handleOAuthCallback, setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-white text-lg">Processing OAuth login...</p>
      </div>
    </div>
  );
}
