
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, Mail, Printer, Save, MessageSquare, LoaderCircle, ScanSearch } from 'lucide-react';
import { medicalImagesAPI } from '@/lib/api';

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  
  date: string;
}

interface GradeResultProps {
  patientInfo: PatientInfo;
  fibrosis: {
    grade: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
    confidence: number;
  };
  probabilities?: Record<'F0' | 'F1' | 'F2' | 'F3' | 'F4', number>;
  modelVersion?: string;
  flags?: string[];
  medicalImageId?: string;
  analysis: string[];
}

export function GradeResult({
  patientInfo,
  fibrosis,
  probabilities,
  modelVersion,
  flags = [],
  medicalImageId,
  analysis,
}: GradeResultProps) {
  const { toast } = useToast();
  const [activationMapUrl, setActivationMapUrl] = useState<string | null>(null);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [explanationError, setExplanationError] = useState('');

  useEffect(() => () => {
    if (activationMapUrl) URL.revokeObjectURL(activationMapUrl);
  }, [activationMapUrl]);

  const handleGenerateActivationMap = async () => {
    if (!medicalImageId) return;
    setIsGeneratingMap(true);
    setExplanationError('');
    try {
      const blob = await medicalImagesAPI.explainImage(medicalImageId);
      setActivationMapUrl(URL.createObjectURL(blob));
    } catch (error) {
      setExplanationError(error instanceof Error ? error.message : 'Could not generate the activation visualization.');
    } finally {
      setIsGeneratingMap(false);
    }
  };

  // Map fibrosis grades to color classes
  const gradeToColorClass = {
    'F0': 'text-blue-500',
    'F1': 'text-green-500',
    'F2': 'text-yellow-500',
    'F3': 'text-orange-500',
    'F4': 'text-red-500'
  };

  const gradeToProgressColor = {
    'F0': 'bg-blue-500',
    'F1': 'bg-green-500',
    'F2': 'bg-yellow-500',
    'F3': 'bg-orange-500',
    'F4': 'bg-red-500'
  };

  const handleDownloadPDF = async () => {
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
        const logoUrl = (await import('@/lib/images/TR_logo.png')).default as string;
        const circleDataURL = await loadCircularImageDataURL(logoUrl, 256, { borderColor: '#1f2937', borderWidth: 1.5 });
        doc.addImage(circleDataURL, 'PNG', 20, 15, 28, 28);
      } catch (error) {
        console.log('Logo load failed, continuing without image header');
      }
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Professional Medical Imaging Report', 70, 35);
      
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
      doc.text(`Patient ID: ${patientInfo.id}`, 20, 80);
      doc.text(`Patient Name: ${patientInfo.name}`, 20, 90);
      doc.text(`Age: ${patientInfo.age}`, 20, 100);
      doc.text(`Gender: ${patientInfo.gender}`, 20, 110);
      doc.text(`Examination Date: ${patientInfo.date}`, 20, 120);
      
      // Assessment Results Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FIBROSIS ASSESSMENT', 20, 140);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fibrosis Grade: ${fibrosis.grade}`, 20, 155);
      doc.text(`Uncalibrated model score: ${Math.round(fibrosis.confidence)}%`, 20, 165);
      doc.text('Status: Draft - requires clinician review', 20, 175);
      doc.text('Decision support only. Not a diagnosis.', 20, 185);
      if (modelVersion) doc.text(`Model: ${modelVersion}`, 20, 195);

      if (probabilities) {
        doc.setFontSize(11);
        doc.text('Uncalibrated class scores:', 20, 210);
        doc.text(['F0', 'F1', 'F2', 'F3', 'F4']
          .map((label) => `${label}: ${(probabilities[label as keyof typeof probabilities] * 100).toFixed(1)}%`)
          .join('    '), 20, 219);
      }
      
      // Clinical Analysis Section
      if (analysis && analysis.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('MODEL OUTPUT', 20, probabilities ? 235 : 205);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = probabilities ? 250 : 220;
        
        analysis.forEach((item: string, index: number) => {
          const splitText = doc.splitTextToSize(`${index + 1}. ${item}`, 170);
          doc.text(splitText, 20, yPos);
          yPos += splitText.length * 6 + 3;
          
          // Add new page if needed
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
      
      // Footer with current timestamp
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${timestamp} (ID: ${reportId})`, 20, 285);
      doc.text('System: LivSafe Medical Assistant | www.livsafe.com', 20, 290);
      
      // Generate unique filename with current timestamp
      const fileName = `LIVSAFE_${patientInfo.name?.replace(/\s+/g, '_') || patientInfo.id}_${dateString}_${reportId}.pdf`;
      
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
        description: 'Could not generate PDF report. Please try again.',
      });
    }
  };

  const handleEmailReport = () => {
    try {
      // Create email content
      const subject = `Medical Report - ${patientInfo.name} (${patientInfo.id})`;
      const body = `Draft model output for clinician review. This is decision support only, not a diagnosis.\n\nPatient: ${patientInfo.name}\nID: ${patientInfo.id}\nDate: ${patientInfo.date}\nTop-ranked class: ${fibrosis.grade}\nUncalibrated model score: ${Math.round(fibrosis.confidence)}%\n\nModel: ${modelVersion || 'not recorded'}\n${probabilities ? `Uncalibrated class scores: ${Object.entries(probabilities).map(([label, score]) => `${label} ${(score * 100).toFixed(1)}%`).join(', ')}` : ''}\n\nRequires clinician review.`;
      
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, '_blank');
      
      toast({
        title: 'Email Client Opened',
        description: 'Medical report email has been prepared',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Email Failed',
        description: 'Could not open email client',
      });
    }
  };

  const handlePrintReport = () => {
    try {
      // Create printable content
      const printContent = `
        <html>
          <head><title>Medical Report - ${patientInfo.name}</title></head>
          <body style="font-family: Arial, sans-serif; margin: 20px;">
            <h1>Medical Imaging Report</h1>
            <hr>
            <h2>Patient Information</h2>
            <p><strong>ID:</strong> ${patientInfo.id}</p>
            <p><strong>Name:</strong> ${patientInfo.name}</p>
            <p><strong>Age:</strong> ${patientInfo.age}</p>
            <p><strong>Gender:</strong> ${patientInfo.gender}</p>
            <p><strong>Date:</strong> ${patientInfo.date}</p>
            
            <h2>Assessment Results</h2>
            <p><strong>Fibrosis Grade:</strong> ${fibrosis.grade}</p>
            <p><strong>Uncalibrated model score:</strong> ${Math.round(fibrosis.confidence)}%</p>
            <p><strong>Status:</strong> Draft - requires clinician review</p>
            <p>Decision support only. Not a diagnosis.</p>
            
            <h2>Model output</h2>
            ${analysis.map(item => `<p>${item}</p>`).join('')}
            ${probabilities ? `<h2>Uncalibrated class scores</h2>${Object.entries(probabilities).map(([label, score]) => `<p>${label}: ${(score * 100).toFixed(1)}%</p>`).join('')}` : ''}
            
            <hr>
            <p><em>Generated: ${new Date().toLocaleString()}</em></p>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast({
        title: 'Print Dialog Opened',
        description: 'Medical report is ready for printing',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Print Failed',
        description: 'Could not open print dialog',
      });
    }
  };

  const handleSaveReport = async () => {
    try {
      // Save to localStorage as well as download
      const reportData = {
        patient: patientInfo,
        assessment: fibrosis,
        analysis: analysis,
        probabilities,
        modelVersion,
        flags,
        calibrated: false,
        status: 'draft',
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
      savedReports.push(reportData);
      localStorage.setItem('savedReports', JSON.stringify(savedReports));
      
      // Also create downloadable copy
      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saved-report-${patientInfo.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Report Saved',
        description: `Medical report for ${patientInfo.name} has been saved and downloaded`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save report',
      });
    }
  };

  const getFibrosisDescription = (grade: string): string => {
    const descriptions = {
      'F0': 'no fibrosis',
      'F1': 'mild fibrosis without septa',
      'F2': 'moderate fibrosis with few septa', 
      'F3': 'severe fibrosis with many septa',
      'F4': 'cirrhosis'
    };
    return descriptions[grade as keyof typeof descriptions] || 'fibrosis assessment';
  };

  return (
    <div className="mt-8 bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Grading Result</h2>
        <span className="text-sm text-primary-300">ID: {patientInfo.id}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-primary-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-medium text-primary-100 mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-primary-300">Name:</span>
                <span className="text-white font-medium">{patientInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-300">Age:</span>
                <span className="text-white font-medium">{patientInfo.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-300">Gender:</span>
                <span className="text-white font-medium">{patientInfo.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-300">Date:</span>
                <span className="text-white font-medium">{patientInfo.date}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-primary-100 mb-4">Classifier output</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-primary-300">Top-ranked class:</span>
                  <span className={`font-bold ${gradeToColorClass[fibrosis.grade]}`}>
                    {fibrosis.grade}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-primary-300">Uncalibrated model score:</span>
                  <span className="font-medium text-white">{Math.round(fibrosis.confidence)}%</span>
                </div>
                <p className="text-xs text-amber-200">Scores are uncalibrated, not clinical confidence.</p>
              </div>
              {probabilities && (
                <div className="space-y-3 border-t border-primary-600 pt-4">
                  <h4 className="text-sm font-medium text-primary-100">All class scores</h4>
                  {(['F0', 'F1', 'F2', 'F3', 'F4'] as const).map((label) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-primary-300">{label}</span>
                        <span className="text-white">{(probabilities[label] * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={probabilities[label] * 100} className="h-1.5 bg-primary-600" />
                    </div>
                  ))}
                </div>
              )}
              {modelVersion && <p className="text-xs text-primary-300">Model: {modelVersion}</p>}
              {flags.length > 0 && (
                <div className="rounded-md border border-amber-300/30 bg-amber-950/30 p-3 text-xs text-amber-100">
                  Model flags: {flags.join(', ')}
                </div>
              )}
              {medicalImageId && (
                <div className="border-t border-primary-600 pt-4">
                  <button
                    type="button"
                    onClick={handleGenerateActivationMap}
                    disabled={isGeneratingMap}
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary-500 px-3 py-2 text-sm font-medium text-primary-100 transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isGeneratingMap
                      ? <LoaderCircle className="animate-spin" aria-hidden="true" size={16} />
                      : <ScanSearch aria-hidden="true" size={16} />}
                    {isGeneratingMap ? 'Generating visualization...' : activationMapUrl ? 'Regenerate activation map' : 'Show activation map'}
                  </button>
                  <p className="mt-2 text-xs text-primary-300">
                    Grad-CAM highlights model activation. Indicative only; not proof of model reasoning.
                  </p>
                  {explanationError && <p className="mt-2 text-xs text-amber-200" role="alert">{explanationError}</p>}
                  {activationMapUrl && (
                    <figure className="mt-4">
                      <img
                        src={activationMapUrl}
                        alt={`Grad-CAM activation visualization for predicted class ${fibrosis.grade}`}
                        className="w-full rounded-md border border-primary-600"
                      />
                      <figcaption className="mt-2 text-xs text-primary-300">
                        Activation visualization for class {fibrosis.grade}. Not a diagnostic finding.
                      </figcaption>
                    </figure>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-primary-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-primary-100 mb-4">Model output</h3>
          <div className="text-primary-200 space-y-4">
            <p>{analysis[0]}</p>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.slice(1, -1).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p>{analysis[analysis.length - 1]}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-wrap gap-4">
        <button 
          onClick={handleSaveReport}
          className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition"
        >
          <Save className="h-5 w-5" />
          Save Report
        </button>
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition"
        >
          <FileText className="h-5 w-5" />
          Download PDF
        </button>
        <button 
          onClick={handlePrintReport}
          className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition"
        >
          <Printer className="h-5 w-5" />
          Print
        </button>
        <button 
          onClick={handleEmailReport}
          className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition"
        >
          <Mail className="h-5 w-5" />
          Email
        </button>
        <button 
          onClick={() => {
            const chatUrl = medicalImageId
              ? `/chat?medicalImageId=${encodeURIComponent(medicalImageId)}`
              : '/chat';
            window.open(chatUrl, '_blank', 'noopener,noreferrer');
          }}
          className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition"
        >
          <MessageSquare className="h-5 w-5" />
          Chat with Livsafe
        </button>
      </div>
    </div>
  );
}
