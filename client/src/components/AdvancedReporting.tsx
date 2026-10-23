import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  Activity,
  BarChart3,
  Settings,
  Eye,
  Printer
} from 'lucide-react';
import { sitePath } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ReportConfig {
  type: 'doctors' | 'patients' | 'records' | 'analytics' | 'comprehensive';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeCharts: boolean;
  includeDetails: boolean;
  filters: {
    doctors: string[];
    specialties: string[];
    status: string[];
  };
}

export function AdvancedReporting() {
  const { toast } = useToast();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'comprehensive',
    format: 'pdf',
    dateRange: '30d',
    includeCharts: true,
    includeDetails: true,
    filters: {
      doctors: [],
      specialties: [],
      status: []
    }
  });

  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const reportTypes = [
    { value: 'doctors', label: 'Doctor Performance Report', icon: Users },
    { value: 'patients', label: 'Patient Analytics Report', icon: Activity },
    { value: 'records', label: 'Medical Records Report', icon: FileText },
    { value: 'analytics', label: 'Analytics Dashboard Report', icon: BarChart3 },
    { value: 'comprehensive', label: 'Comprehensive Organization Report', icon: Settings }
  ];

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call an API to generate the report
      console.log('Generating report with config:', reportConfig);
      
      
      let reportContent = '';
      let fileName = '';
      
      switch (reportConfig.type) {
        case 'doctors':
          reportContent = generateDoctorReport();
          fileName = 'doctor-performance-report';
          break;
        case 'patients':
          reportContent = generatePatientReport();
          fileName = 'patient-analytics-report';
          break;
        case 'records':
          reportContent = generateRecordsReport();
          fileName = 'medical-records-report';
          break;
        case 'analytics':
          reportContent = generateAnalyticsReport();
          fileName = 'analytics-dashboard-report';
          break;
        case 'comprehensive':
          reportContent = generateComprehensiveReport();
          fileName = 'comprehensive-organization-report';
          break;
      }
      
      // Download based on format
      if (reportConfig.format === 'pdf') {
        await downloadAsPDF(reportContent, fileName);
      } else if (reportConfig.format === 'excel') {
        downloadAsExcel(reportContent, fileName);
      } else {
        downloadAsCSV(reportContent, fileName);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handlePreviewReport = () => {
    setPreviewMode(true);
    
    console.log('Previewing report with config:', reportConfig);
    
    // Show preview in alert for now (you can implement a proper modal)
    let previewContent = '';
    switch (reportConfig.type) {
      case 'doctors':
        previewContent = generateDoctorReport();
        break;
      case 'patients':
        previewContent = generatePatientReport();
        break;
      case 'records':
        previewContent = generateRecordsReport();
        break;
      case 'analytics':
        previewContent = generateAnalyticsReport();
        break;
      case 'comprehensive':
        previewContent = generateComprehensiveReport();
        break;
    }
    
    alert(`PREVIEW: ${reportConfig.type.toUpperCase()} REPORT\n\n${previewContent.substring(0, 500)}...`);
    setPreviewMode(false);
  };

  // Report generation functions
  const generateDoctorReport = () => {
    return `DOCTOR PERFORMANCE REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${reportConfig.dateRange}

Report includes:
- Doctor performance metrics
- Patient assignment statistics
- Record completion rates
- Specialty analysis

Filters applied:
- Doctors: ${reportConfig.filters.doctors.join(', ') || 'All'}
- Specialties: ${reportConfig.filters.specialties.join(', ') || 'All'}
- Status: ${reportConfig.filters.status.join(', ') || 'All'}`;
  };

  const generatePatientReport = () => {
    return `PATIENT ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${reportConfig.dateRange}

Report includes:
- Patient demographics
- Visit frequency analysis
- Health status distribution
- Doctor assignment patterns

Filters applied:
- Doctors: ${reportConfig.filters.doctors.join(', ') || 'All'}
- Specialties: ${reportConfig.filters.specialties.join(', ') || 'All'}
- Status: ${reportConfig.filters.status.join(', ') || 'All'}`;
  };

  const generateRecordsReport = () => {
    return `MEDICAL RECORDS REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${reportConfig.dateRange}

Report includes:
- Record volume statistics
- Processing times
- Quality metrics
- Compliance data

Filters applied:
- Doctors: ${reportConfig.filters.doctors.join(', ') || 'All'}
- Specialties: ${reportConfig.filters.specialties.join(', ') || 'All'}
- Status: ${reportConfig.filters.status.join(', ') || 'All'}`;
  };

  const generateAnalyticsReport = () => {
    return `ANALYTICS DASHBOARD REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${reportConfig.dateRange}

Report includes:
- Key performance indicators
- Trend analysis
- Comparative metrics
- Predictive insights

Filters applied:
- Doctors: ${reportConfig.filters.doctors.join(', ') || 'All'}
- Specialties: ${reportConfig.filters.specialties.join(', ') || 'All'}
- Status: ${reportConfig.filters.status.join(', ') || 'All'}`;
  };

  const generateComprehensiveReport = () => {
    return `COMPREHENSIVE ORGANIZATION REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${reportConfig.dateRange}

Report includes:
- Executive summary
- Financial overview
- Operational metrics
- Strategic recommendations
- Risk assessment
- Future projections

Filters applied:
- Doctors: ${reportConfig.filters.doctors.join(', ') || 'All'}
- Specialties: ${reportConfig.filters.specialties.join(', ') || 'All'}
- Status: ${reportConfig.filters.status.join(', ') || 'All'}`;
  };

  // Download functions
  const downloadAsPDF = async (content: string, fileName: string) => {
    try {
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
        const circleDataURL = await loadCircularImageDataURL(logoUrl, 256, { borderColor: '#1f2937', borderWidth: 1.5 });
        doc.addImage(circleDataURL, 'PNG', 20, 15, 28, 28);
      } catch (error) {
        console.log('Logo load failed, continuing without image header');
      }
      
      // Header label moved right of logo
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Professional Organization Report', 70, 35);
      
      // Report ID and timestamp (always current)
      const reportId = Math.random().toString(36).substr(2, 8).toUpperCase();
      doc.setFontSize(10);
      doc.text(`Report ID: ${reportId}`, 140, 25);
      doc.text(`Generated: ${timestamp}`, 140, 35);
      doc.text(`Date: ${dateString}`, 140, 45);
      
      // Report Content Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('REPORT DETAILS', 20, 65);
      
      // Add content with proper pagination
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 80;
      
      const lines = doc.splitTextToSize(content, 170);
      
      lines.forEach((line: string) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      
      // Footer with current timestamp
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${timestamp} (ID: ${reportId})`, 20, 285);
      doc.text('System: LivSafe Medical Assistant | www.livsafe.com', 20, 290);
      
      // Generate unique filename with current timestamp
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
      const finalFileName = `LIVSAFE_${cleanFileName}_${dateString}_${reportId}.pdf`;
      
      // Save the PDF
      doc.save(finalFileName);
      
      toast({
        title: 'PDF Generated',
        description: `Report downloaded with ID ${reportId}`,
        className: 'text-white',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download with better error handling
      toast({
        variant: 'destructive',
        title: 'PDF Generation Failed',
        description: 'Falling back to text format',
        className: 'text-white',
      });
      downloadAsText(content, fileName);
    }
  };

  const downloadAsExcel = (content: string, fileName: string) => {
    // For now, download as CSV (you can implement proper Excel generation)
    downloadAsCSV(content, fileName);
  };

  const downloadAsCSV = (content: string, fileName: string) => {
    const csvContent = content.split('\n').map(line => `"${line}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsText = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateConfig = (key: keyof ReportConfig, value: any) => {
    setReportConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Reporting</h2>
          <p className="text-primary-300">Generate comprehensive reports and analytics</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePreviewReport}
            className="border-primary-600 text-primary-100 hover:bg-primary-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={generating}
            className="bg-accent hover:bg-accent/90"
          >
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <Card className="bg-primary-800 border-primary-700">
            <CardHeader>
              <CardTitle className="text-white">Report Type</CardTitle>
              <CardDescription className="text-primary-300">
                Choose the type of report you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        reportConfig.type === type.value
                          ? 'border-accent bg-accent/10'
                          : 'border-primary-600 hover:border-primary-500'
                      }`}
                      onClick={() => updateConfig('type', type.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-accent" />
                        <div>
                          <h3 className="font-medium text-white">{type.label}</h3>
                          <p className="text-sm text-primary-300">
                            {type.value === 'comprehensive' 
                              ? 'Complete organization overview'
                              : `Detailed ${type.value} analysis`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Report Settings */}
          <Card className="bg-primary-800 border-primary-700">
            <CardHeader>
              <CardTitle className="text-white">Report Settings</CardTitle>
              <CardDescription className="text-primary-300">
                Configure your report format and options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-primary-200">Export Format</Label>
                  <Select value={reportConfig.format} onValueChange={(value) => updateConfig('format', value)}>
                    <SelectTrigger className="mt-2 bg-white border-primary-600 text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-primary-600">
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-primary-200">Date Range</Label>
                  <Select value={reportConfig.dateRange} onValueChange={(value) => updateConfig('dateRange', value)}>
                    <SelectTrigger className="mt-2 bg-white border-primary-600 text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-primary-600">
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {reportConfig.dateRange === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-primary-200">Start Date</Label>
                    <Input
                      type="date"
                      value={reportConfig.customStartDate || ''}
                      onChange={(e) => updateConfig('customStartDate', e.target.value)}
                      className="mt-2 bg-white border-primary-600 text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-primary-200">End Date</Label>
                    <Input
                      type="date"
                      value={reportConfig.customEndDate || ''}
                      onChange={(e) => updateConfig('customEndDate', e.target.value)}
                      className="mt-2 bg-white border-primary-600 text-black"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={reportConfig.includeCharts}
                    onCheckedChange={(checked) => updateConfig('includeCharts', checked)}
                  />
                  <Label htmlFor="includeCharts" className="text-primary-200">
                    Include charts and visualizations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDetails"
                    checked={reportConfig.includeDetails}
                    onCheckedChange={(checked) => updateConfig('includeDetails', checked)}
                  />
                  <Label htmlFor="includeDetails" className="text-primary-200">
                    Include detailed data tables
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-primary-800 border-primary-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Reports</CardTitle>
              <CardDescription className="text-primary-300">
                Generate common reports instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-primary-600 text-primary-100 hover:bg-primary-600"
                onClick={() => {
                  updateConfig('type', 'doctors');
                  updateConfig('format', 'pdf');
                  updateConfig('dateRange', '30d');
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Doctor Performance
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-primary-600 text-primary-100 hover:bg-primary-600"
                onClick={() => {
                  updateConfig('type', 'patients');
                  updateConfig('format', 'excel');
                  updateConfig('dateRange', '90d');
                }}
              >
                <Activity className="h-4 w-4 mr-2" />
                Patient Analytics
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-primary-600 text-primary-100 hover:bg-primary-600"
                onClick={() => {
                  updateConfig('type', 'records');
                  updateConfig('format', 'csv');
                  updateConfig('dateRange', '1y');
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Records Summary
              </Button>
            </CardContent>
          </Card>

          {/* Report Summary */}
          <Card className="bg-primary-800 border-primary-700">
            <CardHeader>
              <CardTitle className="text-white">Report Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary-300">Type:</span>
                  <span className="text-white font-medium">
                    {reportTypes.find(t => t.value === reportConfig.type)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-300">Format:</span>
                  <span className="text-white font-medium uppercase">{reportConfig.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-300">Date Range:</span>
                  <span className="text-white font-medium">
                    {reportConfig.dateRange === 'custom' 
                      ? 'Custom'
                      : reportConfig.dateRange
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-300">Charts:</span>
                  <span className="text-white font-medium">
                    {reportConfig.includeCharts ? 'Included' : 'Excluded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-300">Details:</span>
                  <span className="text-white font-medium">
                    {reportConfig.includeDetails ? 'Included' : 'Excluded'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="bg-primary-800 border-primary-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary-700 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">Doctor Performance Report</p>
                    <p className="text-primary-300 text-xs">Generated 2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-200 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-700 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">Patient Analytics Report</p>
                    <p className="text-primary-300 text-xs">Generated 1 day ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-200 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
