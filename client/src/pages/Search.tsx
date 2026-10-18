import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { RecordsTable, Record } from '@/components/RecordsTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search as SearchIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { doctorAPI } from '@/lib/api';

export default function Search() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch records from API
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getRecords();
      
      // Transform medical images data to match Record interface
      const transformedRecords = response?.map((medicalImage: any) => ({
        id: medicalImage._id,
        patientName: medicalImage.patient?.fullName || 'Unknown Patient',
        date: new Date(medicalImage.uploadedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        grade: medicalImage.grade || 'Pending',
        confidence: medicalImage.confidence
      })) || [];
      
      setAllRecords(transformedRecords);
    } catch (error) {
      // Error fetching records
      toast({
        title: 'Error',
        description: 'Failed to fetch records. Please try again.',
        variant: 'destructive',
      });
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Load records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records based on search term and filters
  useEffect(() => {
    let filtered = [...allRecords];
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.id.toLowerCase().includes(searchLower) ||
          record.patientName.toLowerCase().includes(searchLower) ||
          record.date.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter((record) => record.grade === gradeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date).getTime();
        
        switch (dateFilter) {
          case 'today':
            return recordDate >= today;
          case 'week':
            const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
            return recordDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
            return recordDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
            return recordDate >= yearAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredRecords(filtered);
  }, [searchTerm, gradeFilter, dateFilter, allRecords]);

  const handleViewRecord = (id: string) => {
    // View record functionality
  };

  const handleEditRecord = (id: string) => {
    // Edit record functionality
  };

  const handleDownloadRecord = async (id: string) => {
    try {
      // Find the specific record
      const record = filteredRecords.find((r: any) => r.id === id);
      if (!record) {
        toast({
          variant: "destructive",
          title: "Record not found",
          description: "Could not find the selected record",
        });
        return;
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
        const logoUrl = (await import('@/lib/images/TR_logo.png')).default as string;
        const circleDataURL = await loadCircularImageDataURL(logoUrl, 256, { borderColor: '#1f2937', borderWidth: 1.5 });
        doc.addImage(circleDataURL, 'PNG', 20, 15, 28, 28);
      } catch (error) {
        console.log('Logo load failed, continuing without image header');
      }
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
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
      doc.text(`Record ID: ${record.displayId || record.id}`, 20, 80);
      doc.text(`Patient Name: ${record.patientName}`, 20, 90);
      // Age/Gender not available in search rows; omit to avoid N/A noise
      doc.text(`Examination Date: ${record.date}`, 20, 100);
      
      // Assessment Results Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSESSMENT RESULTS', 20, 140);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fibrosis Grade: ${record.grade}`, 20, 155);
      doc.text(`Uncalibrated model score: ${record.confidence ?? 'N/A'}%`, 20, 165);
      
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
      
      // Recommendations Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS', 20, 230);
      
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
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
      });
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-8">Search Records</h1>
          
          <div className="mb-8">
            <div className="relative">
              <Input 
                type="text" 
                className="w-full px-5 py-4 pr-12 bg-white border border-primary-600 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" 
                placeholder="Search by Patient ID, Name, or Date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <SearchIcon className="text-primary-400 h-5 w-5" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center">
                <Label className="mr-2 text-white text-sm font-medium">Filter by:</Label>
                <Select onValueChange={setGradeFilter} defaultValue="all">
                  <SelectTrigger className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1.5 text-white text-sm">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-900 border-primary-600 text-white">
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="F0">F0</SelectItem>
                    <SelectItem value="F1">F1</SelectItem>
                    <SelectItem value="F2">F2</SelectItem>
                    <SelectItem value="F3">F3</SelectItem>
                    <SelectItem value="F4">F4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center">
                <Label className="mr-2 text-white text-sm font-medium">Date:</Label>
                <Select onValueChange={setDateFilter} defaultValue="all">
                  <SelectTrigger className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1.5 text-white text-sm">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-900 border-primary-600 text-white">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Search Results */}
          {loading ? (
            <div className="bg-primary-700 rounded-xl border border-primary-600 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-white text-lg">Loading records...</p>
              </div>
            </div>
          ) : (
            <RecordsTable
              records={filteredRecords}
              showConfidence={true}
              title="Search Results"
              isSearchResult={true}
              onViewRecord={handleViewRecord}
              
              onDownloadRecord={handleDownloadRecord}
            />
          )}
        </div>
      </section>
    </div>
  );
}
