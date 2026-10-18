import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { UserMenu } from '@/components/UserMenu';
import { StatCard } from '@/components/StatCard';
import { DoctorList, Doctor } from '@/components/DoctorList';
import { OrganizationAnalytics } from '@/components/OrganizationAnalytics';
import { OrganizationPatientManagement } from '@/components/OrganizationPatientManagement';
import { AdvancedReporting } from '@/components/AdvancedReporting';

import { Users, ChartLine, CalendarDays, LogIn, BarChart3, UserCheck, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationAPI } from '@/lib/api';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrganizationDashboard() {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await organizationAPI.getDashboard();
        setDashboardData(data);
      } catch (error: any) {
        // Show error but continue with fallback data
        toast({
          variant: 'destructive', 
          title: 'Dashboard Data Unavailable',
          description: 'Unable to load live data. Showing dashboard with sample data.',
          className: 'text-white',
        });
        
        // Always show dashboard with fallback data
        setDashboardData({
          stats: {
            totalDoctors: 0,
            doctorsChange: '+0 from last month',
            totalRecordsToday: 0,
            recordsTodayChange: '+0 from yesterday',
            totalRecordsMonth: 0,
            recordsMonthChange: '+0 from last month',
          },
          doctors: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleRemoveDoctor = async (doctorId: string) => {
    try {
      // Get current user to get organization ID
      const currentUser = await organizationAPI.getCurrentUser();
      const organizationId = currentUser?.id;
      
      if (!organizationId) {
        throw new Error('Organization ID not found');
      }

      
      await organizationAPI.removeDoctor(organizationId, doctorId);
      toast({
        title: 'Doctor removed',
        description: 'Doctor has been removed from your organization',
        className: 'text-white',
      });
      
      // Refresh dashboard data
      const data = await organizationAPI.getDashboard();
      setDashboardData(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove doctor',
        description: error.message || 'An error occurred while removing the doctor',
        className: 'text-white',
      });
    }
  };

  const handleAddDoctor = async (doctorData: any) => {
    try {
      // Get current user to get organization ID
      const currentUser = await organizationAPI.getCurrentUser();
      const organizationId = currentUser?.id;
      
      if (!organizationId) {
        throw new Error('Organization ID not found');
      }

      await organizationAPI.addDoctor(organizationId, doctorData);
      toast({
        title: 'Doctor added',
        description: 'New doctor has been added to your organization',
        className: 'text-white',
      });
      
      // Refresh dashboard data
      const data = await organizationAPI.getDashboard();
      setDashboardData(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add doctor',
        description: 'An error occurred while adding the new doctor',
        className: 'text-white',
      });
    }
  };


  // Show loading state
  if (loading || !dashboardData) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="organization" showAuthButtons={false} />
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Organization Dashboard</h1>
              <UserMenu />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-24 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
              <div className="h-24 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
              <div className="h-24 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
            </div>
            <div className="mt-8 h-80 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="organization" showAuthButtons={false} />
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Organization Dashboard</h1>
            <UserMenu />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Doctors"
              value={dashboardData.stats.totalDoctors}
              change={dashboardData.stats.doctorsChange}
              icon={<Users className="h-5 w-5" />}
              iconColor="text-secondary-500"
              iconBgColor="bg-secondary-500 bg-opacity-20 text-white"
            />
            <StatCard
              title="Records Today"
              value={dashboardData.stats.totalRecordsToday}
              change={dashboardData.stats.recordsTodayChange}
              icon={<CalendarDays className="h-5 w-5" />}
              iconColor="text-accent"
              iconBgColor="bg-accent bg-opacity-20"
            />
            <StatCard
              title="Records This Month"
              value={dashboardData.stats.totalRecordsMonth}
              change={dashboardData.stats.recordsMonthChange}
              icon={<ChartLine className="h-5 w-5" />}
              iconColor="text-green-500"
              iconBgColor="bg-green-500 bg-opacity-20"
            />
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="doctors" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-primary-800 border border-primary-600">
              <TabsTrigger 
                value="doctors" 
                className="data-[state=active]:bg-accent data-[state=active]:text-white text-primary-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Doctors
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-accent data-[state=active]:text-white text-primary-200"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="patients" 
                className="data-[state=active]:bg-accent data-[state=active]:text-white text-primary-200"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Patients
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-accent data-[state=active]:text-white text-primary-200"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="doctors" className="mt-6">
              <DoctorList
                doctors={dashboardData.doctors || []}
                onRemoveDoctor={handleRemoveDoctor}
                onAddDoctor={handleAddDoctor}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <OrganizationAnalytics />
            </TabsContent>

            <TabsContent value="patients" className="mt-6">
              <OrganizationPatientManagement />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <AdvancedReporting />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
