import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import { organizationAPI } from '@/lib/api';

interface AnalyticsData {
  totalDoctors: number;
  totalPatients: number;
  totalRecords: number;
  recordsThisMonth: number;
  recordsLastMonth: number;
  growthRate: number;
  topSpecialties: Array<{ specialty: string; count: number }>;
  monthlyTrends: Array<{ month: string; records: number }>;
  doctorActivity: Array<{ doctorName: string; records: number; patients: number }>;
}

export function OrganizationAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ doctorName: string; records: number; patients: number } | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      // Fetch real analytics data from the API
      const data = await organizationAPI.getAnalytics(timeRange);
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleExport = () => {
    if (!analyticsData) return;
    
    // Create CSV content
    const csvContent = [
      // Header
      ['Analytics Report', 'Generated on ' + new Date().toLocaleDateString()],
      [],
      // Summary stats
      ['Metric', 'Value'],
      ['Total Doctors', analyticsData.totalDoctors],
      ['Total Patients', analyticsData.totalPatients],
      ['Total Records', analyticsData.totalRecords],
      ['Records This Month', analyticsData.recordsThisMonth],
      ['Records Last Month', analyticsData.recordsLastMonth],
      ['Growth Rate (%)', analyticsData.growthRate],
      [],
      // Top specialties
      ['Top Specialties', 'Doctor Count'],
      ...analyticsData.topSpecialties.map(s => [s.specialty, s.count]),
      [],
      // Monthly trends
      ['Monthly Trends', 'Records'],
      ...analyticsData.monthlyTrends.map(t => [t.month, t.records]),
      [],
      // Doctor activity
      ['Doctor Activity', 'Records', 'Patients'],
      ...analyticsData.doctorActivity.map(d => [d.doctorName, d.records, d.patients])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDoctorDetails = (doctor: { doctorName: string; records: number; patients: number }) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-xl">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-primary-300">Comprehensive insights into your organization's performance</p>
          {lastUpdated && (
            <p className="text-xs text-primary-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-primary-800 border-primary-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-primary-800 border-primary-600">
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "border-primary-600 text-primary-100 hover:bg-primary-600"}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="border-primary-600 text-primary-100 hover:bg-primary-600"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} className="bg-accent hover:bg-accent/90">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-primary-800 border-primary-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-200">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.totalDoctors}</div>
            <p className="text-xs text-primary-300">Active medical staff</p>
          </CardContent>
        </Card>

        <Card className="bg-primary-800 border-primary-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-200">Total Patients</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.totalPatients}</div>
            <p className="text-xs text-primary-300">Registered patients</p>
          </CardContent>
        </Card>

        <Card className="bg-primary-800 border-primary-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-200">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.totalRecords}</div>
            <p className="text-xs text-primary-300">Medical records created</p>
          </CardContent>
        </Card>

        <Card className="bg-primary-800 border-primary-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-200">Growth Rate</CardTitle>
            {analyticsData.growthRate > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.growthRate}%</div>
            <p className="text-xs text-primary-300">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Specialties */}
        <Card className="bg-primary-800 border-primary-700">
          <CardHeader>
            <CardTitle className="text-white">Top Specialties</CardTitle>
            <CardDescription className="text-primary-300">
              Most active medical specialties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topSpecialties.map((specialty, index) => (
                <div key={specialty.specialty} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">{specialty.specialty}</span>
                  </div>
                  <span className="text-primary-200 font-semibold">{specialty.count} doctors</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-primary-800 border-primary-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Trends</CardTitle>
            <CardDescription className="text-primary-300">
              Records created per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.monthlyTrends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <span className="text-white font-medium">{trend.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-primary-700 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${(trend.records / 50) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-primary-200 text-sm w-8">{trend.records}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Activity */}
      <Card className="bg-primary-800 border-primary-700">
        <CardHeader>
          <CardTitle className="text-white">Doctor Activity</CardTitle>
          <CardDescription className="text-primary-300">
            Most active doctors in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-600">
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Doctor</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Records Created</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Patients Seen</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Activity Level</th>
                  <th className="text-left py-3 px-4 text-primary-200 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.doctorActivity.map((doctor, index) => (
                  <tr key={index} className="border-b border-primary-700">
                    <td className="py-3 px-4 text-white font-medium">{doctor.doctorName}</td>
                    <td className="py-3 px-4 text-primary-200">{doctor.records}</td>
                    <td className="py-3 px-4 text-primary-200">{doctor.patients}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-primary-700 rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full" 
                            style={{ width: `${(doctor.records / 15) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-primary-200 text-sm">
                          {Math.round((doctor.records / 15) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDoctorDetails(doctor)}
                        className="text-accent hover:text-accent/80 hover:bg-accent/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Details Modal */}
      {showDoctorModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-800 border border-primary-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Doctor Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDoctorModal(false)}
                className="text-primary-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">{selectedDoctor.doctorName}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-accent">{selectedDoctor.records}</div>
                    <div className="text-sm text-primary-300">Records Created</div>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-500">{selectedDoctor.patients}</div>
                    <div className="text-sm text-primary-300">Patients Seen</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-primary-300">
                <p>Activity Level: {Math.round((selectedDoctor.records / 15) * 100)}%</p>
                <p>Time Period: Last {timeRange} days</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
