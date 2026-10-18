import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Download,
  MessageSquare,
  Calendar,
  User,
  Activity,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doctorAPI, medicalImagesAPI } from '@/lib/api';

export default function PatientRecordView() {
  const { toast } = useToast();
  const { id } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        if (id) {


          let data;
          try {

                                                   data = await doctorAPI.getRecord(id);

          } catch (doctorError) {


          try {

                                                           const imageData = await medicalImagesAPI.getImage(id);

               if (imageData) {
                // Normalize medical image into a consistent record shape
                data = {
                  id: imageData._id || imageData.id,
                  patientName: imageData.patient?.fullName || imageData.patientName || 'Unknown Patient',
                  patient: imageData.patient,
                  date: imageData.uploadedAt
                    ? new Date(imageData.uploadedAt).toLocaleDateString()
                    : new Date().toLocaleDateString(),
                  grade: imageData.grade || 'Pending',
                  confidence: imageData.confidence ?? null,
                  age: imageData.patient?.age ?? imageData.age ?? 'N/A',
                  gender: imageData.patient?.gender ?? imageData.gender ?? 'N/A',
                  analysis: imageData.analysis || (imageData.description ? [imageData.description] : []),
                  createdAt: imageData.createdAt || imageData.uploadedAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  updatedAt: imageData.updatedAt || imageData.uploadedAt || new Date(),
                  uploadedAt: imageData.uploadedAt,
                };

              } else {

                throw new Error("No data found in medical images");
              }
            } catch (imageError) {

              throw doctorError; // Re-throw the original doctor error
            }
          }

                     if (data) {
             // If doctor API returned raw record, normalize it
             if (data && !data.patientName && (data.patient || data._id)) {
               data = {
                 id: data._id || data.id,
                 patientName: data.patient?.fullName || 'Unknown Patient',
                 patient: data.patient,
                 date: data.uploadedAt ? new Date(data.uploadedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                 grade: data.grade || 'Pending',
                 confidence: data.confidence ?? null,
                 age: data.patient?.age ?? data.age ?? 'N/A',
                 gender: data.patient?.gender ?? data.gender ?? 'N/A',
                 analysis: data.analysis || (data.description ? [data.description] : []),
                 createdAt: data.createdAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                 updatedAt: data.updatedAt || new Date(),
                 uploadedAt: data.uploadedAt,
               };
             }
             setRecord(data);
           } else {

            throw new Error("No record data received");
          }
        }
      } catch (error: any) {


        toast({
          variant: "destructive",
          title: "Error loading record",
          description: error.message || "Failed to load patient record",
          className:'text-white'
        });

        setRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, toast]);

  const getGradeDescription = (grade: string): string => {
    const descriptions = {
      F0: "No fibrosis",
      F1: "Mild fibrosis (portal fibrosis without septa)",
      F2: "Moderate fibrosis (portal fibrosis with few septa)",
      F3: "Severe fibrosis (numerous septa without cirrhosis)",
      F4: "Cirrhosis (advanced fibrosis with regenerative nodules)",
    };
    return descriptions[grade as keyof typeof descriptions] || "Fibrosis assessment";
  };

  const getGradeColor = (grade: string): string => {
    const colors = {
      F0: "text-blue-500",
      F1: "text-green-500",
      F2: "text-yellow-500",
      F3: "text-orange-500",
      F4: "text-red-500",
    };
    return colors[grade as keyof typeof colors] || "text-gray-500";
  };

  const handleDownloadPDF = async () => {
    if (!record) return;

    try {
      // Generate fresh PDF using client-side jsPDF with current timestamp
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF();

      // Generate unique timestamp for this report
      const currentTime = new Date();
      const timestamp = currentTime.toLocaleString();
      const dateString = currentTime.toISOString().split('T')[0];
      
      // Generate PDF with current data
      
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
      doc.text("Professional Medical Report", 70, 35);
      
      // Report ID and timestamp (always current)
      const reportId = Math.random().toString(36).substr(2, 8).toUpperCase();
      doc.setFontSize(10);
      doc.text(`Report ID: ${reportId}`, 140, 25);
      doc.text(`Generated: ${timestamp}`, 140, 35);
      doc.text(`Date: ${dateString}`, 140, 45);

      // Patient Information Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("PATIENT INFORMATION", 20, 65);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Record ID: ${record.id}`, 20, 80);
      doc.text(`Patient Name: ${record.patientName}`, 20, 90);
      doc.text(`Age: ${record.age || "N/A"}`, 20, 100);
      doc.text(`Gender: ${record.gender || "N/A"}`, 20, 110);
      doc.text(`Examination Date: ${record.date}`, 20, 120);

      // Assessment Results Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ASSESSMENT RESULTS", 20, 140);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Fibrosis Grade: ${record.grade}`, 20, 155);
      doc.text(`Uncalibrated model score: ${record.confidence ?? 'N/A'}%`, 20, 165);
      doc.text("Draft - requires clinician review. Decision support only, not a diagnosis.", 20, 185);
      doc.text(`Severity: ${getGradeDescription(record.grade)}`, 20, 175);

      // Clinical Analysis Section
      if (record.analysis && record.analysis.length > 0) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("CLINICAL ANALYSIS", 20, 195);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let yPos = 210;
        record.analysis.forEach((item: string, index: number) => {
          const splitText = doc.splitTextToSize(`${index + 1}. ${item}`, 170);
          doc.text(splitText, 20, yPos);
          yPos += splitText.length * 6 + 3;
        });
      }

      // No retrieval-backed guideline context is available for this record.
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("GUIDELINE CONTEXT", 20, 230);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Guideline context unavailable. Clinician review required.", 20, 245);

      // Footer with current timestamp
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${timestamp} (ID: ${reportId})`, 20, 285);
      doc.text("System: LivSafe Medical Assistant | www.livsafe.com", 20, 290);

      // Generate unique filename with current timestamp
      const fileName = `LIVSAFE_${record.patientName?.replace(/\s+/g, '_') || record.id}_${dateString}_${reportId}.pdf`;
      
      doc.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: `Medical report ${record.id} generated at ${timestamp}`,
        className:'text-white'
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        className:'text-white'
      });
    }
  };

  const handleOpenChat = () => {
    if (!record) return;
    if (!/^[a-f\d]{24}$/i.test(record.id)) {
      toast({
        variant: 'destructive',
        title: 'Image unavailable',
        description: 'This record has no saved medical image to attach to the conversation.',
      });
      return;
    }

    const chatUrl = `/chat?medicalImageId=${encodeURIComponent(record.id)}`;
    window.open(chatUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="doctor" showAuthButtons={false} />
        <section className="py-12 bg-primary-800">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center text-white text-xl">Loading patient record...</div>
          </div>
        </section>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="doctor" showAuthButtons={false} />
        <section className="py-12 bg-primary-800">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center text-white text-xl">Record not found</div>
            <div className="text-center mt-4">
              <Link href="/doctor/dashboard">
                <Button className="bg-accent hover:bg-accent/90">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />

      <section className="py-12 bg-primary-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/doctor/dashboard">
              <span className="inline-flex items-center text-primary-300 hover:text-white transition cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Patient Record Details</h1>
          </div>

          <div className="bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-primary-600">
              <div>
                <h2 className="text-2xl font-bold text-white">{record.patientName}</h2>
                <p className="text-primary-300">Patient ID: {record.id}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownloadPDF} variant="outline" className="border-primary-600 !text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button onClick={handleOpenChat} className="bg-accent hover:bg-accent/90">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Dr. Thompson
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-primary-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-100 mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-primary-300">Name:</span>
                    <span className="text-white font-medium">
                      {record.patient?.fullName || record.patientName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Age:</span>
                    <span className="text-white font-medium">
                      {record.patient?.age || record.age || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Gender:</span>
                    <span className="text-white font-medium">
                      {record.patient?.gender || record.gender || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Exam Date:</span>
                    <span className="text-white font-medium">
                      {record.uploadedAt ? 
                        new Date(record.uploadedAt).toLocaleDateString() : 
                        record.date || new Date().toLocaleDateString()}
                    </span>
                  </div>
                  {record.patient?.email && (
                    <div className="flex justify-between">
                      <span className="text-primary-300">Email:</span>
                      <span className="text-white font-medium">{record.patient.email}</span>
                    </div>
                  )}
                  {record.patient?.phone && (
                    <div className="flex justify-between">
                      <span className="text-primary-300">Phone:</span>
                      <span className="text-white font-medium">{record.patient.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-primary-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-100 mb-4 flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Assessment Results
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-primary-300">Fibrosis Grade:</span>
                      <span className={`font-bold text-lg ${getGradeColor(record.grade)}`}>
                        {record.grade}
                      </span>
                    </div>
                    <p className="text-sm text-primary-200">{getGradeDescription(record.grade)}</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-primary-300">Uncalibrated model score:</span>
                      <span className="font-medium text-white">{record.confidence}%</span>
                    </div>
                    <p className="mb-2 text-xs text-amber-200">Not calibrated clinical confidence.</p>
                    <div className="w-full bg-primary-600 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${record.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {record.analysis && (
              <div className="mt-8 bg-primary-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-100 mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Clinical Analysis
                </h3>
                <div className="text-primary-200 space-y-3">
                  {record.analysis.map((item: string, index: number) => (
                    <p key={index} className="leading-relaxed">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-primary-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-400">
                                 <div className="flex items-center">
                   <Calendar className="mr-2 h-4 w-4" />
                   Created: {record.uploadedAt ? new Date(record.uploadedAt).toLocaleString() : 'Not available'}
                 </div>
                                   <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Last Updated: {new Date().toLocaleString()}
                  </div>
              </div>
              
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

