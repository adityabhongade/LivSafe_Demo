import { useState } from 'react';
import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { FileUpload } from '@/components/FileUpload';
import { GradeResult } from '@/components/GradeResult';
import { ImageReviewDraft } from '@/components/ImageReviewDraft';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doctorAPI } from '@/lib/api';

interface UploadedRecord {
  id: string;
  medicalImageId: string;
  classification: {
    grade: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
    confidence: number;
    probabilities: Record<'F0' | 'F1' | 'F2' | 'F3' | 'F4', number>;
    modelVersion: string;
    flags: string[];
  };
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    date: string;
  };
}

export default function GradeReport() {
  const { toast } = useToast();
  const [isGrading, setIsGrading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [uploadedRecord, setUploadedRecord] = useState<UploadedRecord | null>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setUploadedRecord(null);
  };

  const handleLoadSampleScan = async () => {
    try {
      const response = await fetch('/sample-ultrasound.png');
      const blob = await response.blob();
      const file = new File([blob], 'sample-liver-ultrasound.png', { type: 'image/png' });
      setUploadedFile(file);
      setPatientName('Marcus Vance');
      setPatientAge('52');
      setPatientGender('male');
      setUploadedRecord(null);
      toast({
        title: 'Sample ultrasound scan loaded',
        description: 'Patient Marcus Vance (52, M) ready for classification.',
        className: 'text-white',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Could not load sample scan',
        description: 'Please upload an image manually.',
      });
    }
  };

  const handleGradeImage = async () => {
    // Validate form
    if (!patientName || !patientAge || !patientGender || !uploadedFile) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please fill in all fields and upload an image',
      });
      return;
    }

    setIsGrading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('patientName', patientName);
      formData.append('patientAge', patientAge);
      formData.append('patientGender', patientGender);
      formData.append('description', `Medical image analysis for ${patientName}`);

      const result = await doctorAPI.createRecord(formData);

      const medicalImageId = result.medicalImageId || result.medicalImage?._id;
      if (!medicalImageId) throw new Error('Upload succeeded but the image record identifier was not returned.');

      setUploadedRecord({
        id: result.id,
        medicalImageId,
        classification: result.analysis,
        patientInfo: {
          name: patientName,
          age: parseInt(patientAge, 10),
          gender: patientGender,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        },
      });
      toast({
        title: 'Classification complete',
        description: `Model output: ${result.analysis.grade}. Scores are uncalibrated and require clinician review.`,
        className: 'text-white', 
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Image upload failed',
        description: error instanceof Error ? error.message : 'An error occurred while saving the image.',
        className: 'text-white', 
      });
    } finally {
      setIsGrading(false);
    }
  };


  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/doctor/dashboard" className="inline-flex items-center text-primary-300 hover:text-white transition">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Upload Ultrasound for Review</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-300">
              Classification is decision support only, not a diagnosis. Model scores are uncalibrated and require clinician review.
            </p>
          </div>
          
          <div className="bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label htmlFor="patientName" className="text-primary-100">Patient Name</Label>
                  <Input 
                    id="patientName" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="" 
                    placeholder="Patient name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientAge" className="text-primary-100">Age</Label>
                    <Input 
                      id="patientAge" 
                      type="number" 
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="" 
                      placeholder="Age"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patientGender" className="text-white">Gender</Label>
                    <Select onValueChange={setPatientGender}>
                      <SelectTrigger className="bg-white text-black">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-primary-600 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-primary-100">Ultrasound Image</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSampleScan}
                    className="text-xs border-primary-500 bg-primary-800 text-primary-100 hover:bg-primary-900 hover:text-white"
                  >
                    Quick-load Sample Ultrasound
                  </Button>
                </div>
                <FileUpload onFileSelect={handleFileSelect} accept="image/*" />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleGradeImage}
                  disabled={isGrading || !uploadedFile}
                  className="bg-gradient-to-r from-accent to-accent text-white font-medium py-6 px-8"
                >
                  {isGrading ? 'Classifying image...' : 'Classify image'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Grade Result */}
          {uploadedRecord && (
            <>
              <p className="mt-6 text-sm text-primary-300" role="status">
                Image record {uploadedRecord.id} classified by {uploadedRecord.classification.modelVersion}.
              </p>
              <GradeResult
                patientInfo={{
                  id: uploadedRecord.id,
                  name: uploadedRecord.patientInfo.name,
                  age: uploadedRecord.patientInfo.age,
                  gender: uploadedRecord.patientInfo.gender,
                  date: uploadedRecord.patientInfo.date,
                }}
                fibrosis={{
                  grade: uploadedRecord.classification.grade,
                  confidence: uploadedRecord.classification.confidence,
                }}
                probabilities={uploadedRecord.classification.probabilities}
                modelVersion={uploadedRecord.classification.modelVersion}
                flags={uploadedRecord.classification.flags}
                medicalImageId={uploadedRecord.medicalImageId}
                analysis={[
                  `The classifier's top-ranked class is ${uploadedRecord.classification.grade}. This output is an uncalibrated model score, not a diagnosis.`,
                ]}
              />
              <ImageReviewDraft medicalImageId={uploadedRecord.medicalImageId} />
            </>
          )}
          
          {/* Floating Chat Button */}
          <div className="fixed bottom-6 right-6">
            <button 
              onClick={() => {
                if (uploadedRecord) {
                  const chatUrl = `/chat?medicalImageId=${encodeURIComponent(uploadedRecord.medicalImageId)}`;
                  window.open(chatUrl, '_blank', 'noopener,noreferrer');
                } else {
                  // Open general chat if no grade result
                  window.open('/chat', '_blank');
                }
              }}
              className="w-14 h-14 bg-gradient-to-r from-secondary-500 to-accent rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition"
              title="Discuss this saved ultrasound with MedGemma"
              aria-label="Discuss this saved ultrasound with MedGemma"
            >
              <MessageCircle className="text-white h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
