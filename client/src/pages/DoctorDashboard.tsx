import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { UserMenu } from '@/components/UserMenu';
import { StatCard } from '@/components/StatCard';
import { RecordsTable, Record } from '@/components/RecordsTable';
import { ChartDistribution } from '@/components/ChartDistribution';
import { DownloadDropdown } from '@/components/DownloadDropdown';
import { useToast } from '@/hooks/use-toast';
import { doctorAPI, patientAPI } from '@/lib/api';
import { sitePath } from '@/lib/utils';
import { FolderOpen, ChartLine, CheckCircle2, Plus, PieChart, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [showChart, setShowChart] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Transform record IDs to LIV format for display while preserving original IDs
  const transformRecordIds = (records: any[]) => {
    return records.map(record => ({
      ...record,
      displayId: record.id && record.id.length > 10 
        ? `LIV${Math.floor(100000 + Math.random() * 900000)}` 
        : record.id,
      originalId: record.id // Preserve original ID for API calls
    }));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await doctorAPI.getDashboard();
        // Transform the record IDs to LIV format
        if (data.recentRecords) {
          data.recentRecords = transformRecordIds(data.recentRecords);
        }
        setDashboardData(data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error loading dashboard',
          description: error.message || 'Failed to load dashboard data',
        });
        
        // Fallback to mock data if API fails
        setDashboardData({
          stats: {
            totalRecords: 0,
            totalChange: '+0 from last month',
            monthlyRecords: 0,
            monthlyChange: '+0 from previous month',
            yearToDateRecords: 0,
            gradeCoverage: 0,
            gradeCoverageChange: '+0% from last month',
            averageUncalibratedScore: 0,
          },
          recentRecords: [],
          gradeDistribution: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      const data = await doctorAPI.getDashboard();
      
      if (data.recentRecords) {
        data.recentRecords = transformRecordIds(data.recentRecords);
      }
      setDashboardData(data);
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest data has been loaded',
        className: 'text-white',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh dashboard',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewRecord = (id: string) => {
    setLocation(`/doctor/record/${id}`);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await doctorAPI.deleteRecord(id);
        
        toast({
          title: 'Record Deleted',
          description: `Record ${id} has been deleted successfully`,
          className:'text-white',
        });
        
        // Refresh dashboard data
        refreshDashboard();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: error.message || 'Could not delete record',
        });
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Dynamic import for jsPDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCTOR DASHBOARD REPORT', 20, 30);
      
      // Add generation date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Add stats section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('DASHBOARD STATISTICS', 20, 65);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Records: ${dashboardData.stats.totalRecords}`, 20, 80);
      doc.text(`Monthly Records: ${dashboardData.stats.monthlyRecords}`, 20, 90);
      doc.text(`Year-to-Date Records: ${dashboardData.stats.yearToDateRecords}`, 20, 100);
      doc.text(`Grade Coverage: ${dashboardData.stats.gradeCoverage}%`, 20, 110);
      doc.text(`Average Uncalibrated Model Score: ${dashboardData.stats.averageUncalibratedScore}%`, 20, 120);
      
      // Add recent records section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('RECENT RECORDS', 20, 145);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 160;
      
      dashboardData.recentRecords.forEach((record: any, index: number) => {
        const recordText = `${index + 1}. ${record.patientName} - Grade: ${record.grade} - Date: ${record.date}`;
        const splitText = doc.splitTextToSize(recordText, 170);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 5 + 3;
        
        // Add new page if needed
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add grade distribution if available
      if (dashboardData.gradeDistribution && dashboardData.gradeDistribution.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('GRADE DISTRIBUTION', 20, 30);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let distYPos = 45;
        
        dashboardData.gradeDistribution.forEach((grade: any) => {
          doc.text(`${grade.name}: ${grade.value} records`, 20, distYPos);
          distYPos += 15;
        });
      }
      
      // Save the PDF
      doc.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Dashboard report has been downloaded as PDF',
        className: 'text-white',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF report. Please try again.',
        className: 'text-white',
      });
    }
  };

  const handleDownloadCSV = async () => {
    try {
      // Create CSV content
      const csvHeader = 'Record ID,Patient Name,Date,Grade,Uncalibrated Model Score\n';
      const csvRows = dashboardData.recentRecords.map((record: any) => 
        `${record.id},"${record.patientName}",${record.date},${record.grade},${record.confidence || 'N/A'}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'CSV Downloaded',
        description: 'Dashboard data has been exported to CSV',
        className: 'text-white',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Could not export CSV file',
        className: 'text-white',
      });
    }
  };

  const handleDownloadRecord = async (id: string) => {
    try {
      // Find the specific record
      let record = dashboardData.recentRecords.find((r: any) => r.id === id || r.originalId === id);
      if (!record) {
        throw new Error('Record not found');
      }

      // Enrich with full record if key details are missing
      if (!record.patientName || record.patientName === 'Unknown Patient' || typeof record.age === 'undefined') {
        try {
          const full = await doctorAPI.getRecord(record.originalId || record.id);
          record = {
            ...record,
            patientName: full?.patient?.fullName || record.patientName,
            age: full?.patient?.age ?? record.age,
            gender: full?.patient?.gender ?? record.gender,
            date: full?.uploadedAt ? new Date(full.uploadedAt).toLocaleDateString() : record.date,
          };
        } catch (e) {
          // ignore enrichment errors
        }
      }
      
      // Dynamic import for jsPDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Generate unique timestamp for this report
      const currentTime = new Date();
      const timestamp = currentTime.toLocaleString();
      const dateString = currentTime.toISOString().split('T')[0];
      
      // Load and add circular logo
      try {
        const { loadCircularImageDataURL } = await import('@/lib/pdfUtils');
      const logoUrl = sitePath('logos/livsafe-app-icon.svg');
        // Render at high pixel density for crisp output
        const circleDataURL = await loadCircularImageDataURL(logoUrl, 256, { borderColor: '#1f2937', borderWidth: 1.5 });
        // Place circular logo (display ~28mm for good clarity)
        doc.addImage(circleDataURL, 'PNG', 20, 15, 28, 28);
      } catch (error) {
        console.log('Logo load failed, continuing without image header');
      }
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      // move right so it doesn't overlap the logo
      doc.text('Professional Medical Report', 70, 35);
      
      // Report ID and timestamp (always current)
      const reportId = Math.random().toString(36).substr(2, 8).toUpperCase();
      doc.setFontSize(10);
      doc.text(`Report ID: ${reportId}`, 140, 25);
      doc.text(`Generated: ${timestamp}`, 140, 35);
      doc.text(`Date: ${dateString}`, 140, 45);
      
      // Patient Information Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('PATIENT INFORMATION', 20, 65);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Record ID: ${record.id}`, 20, 80);
      doc.text(`Patient Name: ${record.patientName}`, 20, 90);
      let infoY = 100;
      if (typeof record.age !== 'undefined' && record.age !== 'N/A') {
        doc.text(`Age: ${record.age}`, 20, infoY);
        infoY += 10;
      }
      if (typeof record.gender !== 'undefined' && record.gender !== 'N/A') {
        doc.text(`Gender: ${record.gender}`, 20, infoY);
        infoY += 10;
      }
      doc.text(`Examination Date: ${record.date}`, 20, infoY);
      
      // Assessment Results Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSESSMENT RESULTS', 20, 140);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fibrosis Grade: ${record.grade}`, 20, 155);
      doc.text(`Uncalibrated model score: ${record.confidence ?? 'N/A'}%`, 20, 165);
      doc.text(`Severity: ${getGradeDescription(record.grade)}`, 20, 175);
      
      // Clinical Analysis Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CLINICAL ANALYSIS', 20, 195);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const clinicalText = 'This is an unreviewed decision-support output, not a diagnosis. The displayed model score is uncalibrated and should not be interpreted as clinical confidence. A clinician must review the image and correlate it with the full clinical context.';
      const splitText = doc.splitTextToSize(clinicalText, 170);
      doc.text(splitText, 20, 210);
      
      // No retrieval-backed guideline context is available for this record.
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('GUIDELINE CONTEXT', 20, 230);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Guideline context unavailable. Clinician review required.', 20, 245);
      
      // Footer with current timestamp
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${timestamp} (ID: ${reportId})`, 20, 285);
      doc.text('System: LivSafe Medical Assistant | www.livsafe.com', 20, 290);
      
      // Generate unique filename with current timestamp
      const fileName = `LIVSAFE_${record.patientName?.replace(/\s+/g, '_') || record.id}_${dateString}_${reportId}.pdf`;
      
      // Save the PDF
      doc.save(fileName);
      
      toast({
        title: 'PDF Downloaded',
        description: `Medical report generated with ID ${reportId}`,
        className: 'text-white',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
        className: 'text-white',
      });
    }
  };
  
  const getGradeDescription = (grade: string): string => {
    const descriptions = {
      'F0': 'No fibrosis',
      'F1': 'Mild fibrosis (portal fibrosis without septa)',
      'F2': 'Moderate fibrosis (portal fibrosis with few septa)',
      'F3': 'Severe fibrosis (numerous septa without cirrhosis)',
      'F4': 'Cirrhosis (advanced fibrosis with regenerative nodules)'
    };
    return descriptions[grade as keyof typeof descriptions] || 'Fibrosis assessment';
  };

  // Show loading state
  if (loading || !dashboardData) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="doctor" showAuthButtons={false} />
      <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
              <UserMenu />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <div className="h-24 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
              </div>
              <div className="h-24 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
              <div className="h-24 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
              <div className="h-24 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
            </div>
            <div className="mt-8 h-72 rounded-xl bg-primary-800 border border-primary-700 animate-pulse" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
            <UserMenu />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Records"
              value={dashboardData.stats.totalRecords}
              change={dashboardData.stats.totalChange}
              icon={<FolderOpen className="h-5 w-5" />}
              iconColor="text-secondary-500"
              iconBgColor="bg-secondary-500 bg-opacity-20 text-white border-white"
            />
            <StatCard
              title="Monthly Records"
              value={dashboardData.stats.monthlyRecords}
              change={dashboardData.stats.monthlyChange}
              icon={<ChartLine className="h-5 w-5" />}
              iconColor="text-accent"
              iconBgColor="bg-accent bg-opacity-20"
            />
            <StatCard
              title="Grade Coverage"
              value={`${dashboardData.stats.gradeCoverage}%`}
              change={dashboardData.stats.gradeCoverageChange}
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconColor="text-green-500"
              iconBgColor="bg-green-500 bg-opacity-20"
            />
            <StatCard
              title="Avg Uncalibrated Score"
              value={`${dashboardData.stats.averageUncalibratedScore}%`}
              change="Not calibrated clinical confidence"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconColor="text-blue-500"
              iconBgColor="bg-blue-500 bg-opacity-20"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/doctor/grade">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="mr-2 h-4 w-4" /> Create New Record
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-primary-600 text-white hover:bg-primary-600 hover:text-white"
              onClick={() => setShowChart(true)}
            >
              <PieChart className="mr-2 h-4 w-4" /> View Distribution
            </Button>
            <Button 
              variant="outline" 
              className="border-primary-600 text-white hover:bg-primary-600 hover:text-white"
              onClick={refreshDashboard}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <DownloadDropdown 
              onDownloadPDF={handleDownloadPDF}
              onDownloadCSV={handleDownloadCSV}
            />
          </div>
          
          {/* Recent Records */}
          <RecordsTable
            records={dashboardData.recentRecords}
            onViewRecord={handleViewRecord}
            onDeleteRecord={handleDeleteRecord}
            onDownloadRecord={handleDownloadRecord}
            showConfidence={true}
          />
        </div>
      </section>

      {/* Floating Chat Button */}
      <button 
        className="fixed bottom-4 right-4 bg-accent hover:bg-accent/90 text-white p-4 rounded-full shadow-lg focus:outline-none z-50 transition-all duration-200 hover:scale-105"
        title="Open Medical Chat with Dr. Thompson"
        onClick={() => window.open(sitePath('chat'), '_blank')}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Distribution Chart Dialog */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="bg-primary-800 border-primary-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Fibrosis Grade Distribution</DialogTitle>
            <DialogDescription className="text-primary-200">
              View the distribution of fibrosis grades across all patient records.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ChartDistribution data={dashboardData.gradeDistribution} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
