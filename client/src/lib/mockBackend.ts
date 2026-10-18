/**
 * LivSafe Demo - Self-Contained Mock Backend
 * 
 * Provides a lightweight, in-browser simulated backend for the LivSafe demo.
 * Default user credentials:
 *   Username / Email: user01
 *   Password: user_pass1
 */

export interface MockUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  name: string;
  type: 'doctor' | 'organization';
  specialty?: string;
  organization?: {
    id: string;
    name: string;
    type: string;
    address: string;
  };
  createdAt: string;
}

export const DEMO_CREDENTIALS = {
  username: 'user01',
  email: 'user01@livsafe.demo',
  password: 'user_pass1',
};

export const DEFAULT_DOCTOR_USER: MockUser = {
  id: 'doc-user01',
  email: 'user01@livsafe.demo',
  username: 'user01',
  fullName: 'Dr. Alex Taylor',
  name: 'Dr. Alex Taylor',
  type: 'doctor',
  specialty: 'Hepatology & Ultrasound Imaging',
  organization: {
    id: 'org-demo-1',
    name: 'Metropolitan Liver Health Institute',
    type: 'Hospital',
    address: '450 Health Sciences Blvd, Boston, MA',
  },
  createdAt: '2026-01-15T08:00:00.000Z',
};

// Initial realistic patient records
const INITIAL_RECORDS = [
  {
    id: 'LIV-202601-842',
    originalId: 'rec-001',
    medicalImageId: 'img-001',
    patientName: 'John Doe',
    patient: {
      _id: 'pat-001',
      fullName: 'John Doe',
      age: 54,
      gender: 'male',
    },
    doctor: {
      _id: 'doc-user01',
      fullName: 'Dr. Alex Taylor',
      specialty: 'Hepatology',
    },
    date: 'Oct 14, 2026',
    uploadedAt: '2026-10-14T10:30:00.000Z',
    grade: 'F2',
    confidence: 89.4,
    probabilities: { F0: 0.02, F1: 0.07, F2: 0.894, F3: 0.012, F4: 0.004 },
    modelVersion: '1.0.0-demo',
    calibrated: false,
    flags: ['uncalibrated_scores', 'demo_mode'],
    latencyMs: 135,
    imageUrl: '/sample-ultrasound.png',
    description: 'Routine follow-up ultrasound scan for suspected NAFLD progression.',
  },
  {
    id: 'LIV-202601-791',
    originalId: 'rec-002',
    medicalImageId: 'img-002',
    patientName: 'Maria Santos',
    patient: {
      _id: 'pat-002',
      fullName: 'Maria Santos',
      age: 47,
      gender: 'female',
    },
    doctor: {
      _id: 'doc-user01',
      fullName: 'Dr. Alex Taylor',
      specialty: 'Hepatology',
    },
    date: 'Oct 12, 2026',
    uploadedAt: '2026-10-12T14:15:00.000Z',
    grade: 'F1',
    confidence: 94.1,
    probabilities: { F0: 0.045, F1: 0.941, F2: 0.012, F3: 0.001, F4: 0.001 },
    modelVersion: '1.0.0-demo',
    calibrated: false,
    flags: ['uncalibrated_scores', 'demo_mode'],
    latencyMs: 142,
    imageUrl: '/sample-ultrasound.png',
    description: 'Initial assessment for elevated transaminases.',
  },
  {
    id: 'LIV-202601-630',
    originalId: 'rec-003',
    medicalImageId: 'img-003',
    patientName: 'Robert Johnson',
    patient: {
      _id: 'pat-003',
      fullName: 'Robert Johnson',
      age: 61,
      gender: 'male',
    },
    doctor: {
      _id: 'doc-user01',
      fullName: 'Dr. Alex Taylor',
      specialty: 'Hepatology',
    },
    date: 'Oct 10, 2026',
    uploadedAt: '2026-10-10T09:45:00.000Z',
    grade: 'F4',
    confidence: 96.8,
    probabilities: { F0: 0.001, F1: 0.002, F2: 0.008, F3: 0.021, F4: 0.968 },
    modelVersion: '1.0.0-demo',
    calibrated: false,
    flags: ['uncalibrated_scores', 'demo_mode', 'high_stiffness_suspected'],
    latencyMs: 128,
    imageUrl: '/sample-ultrasound.png',
    description: 'Known chronic hepatitis C with clinical suspicion of advanced cirrhosis.',
  },
  {
    id: 'LIV-202601-512',
    originalId: 'rec-004',
    medicalImageId: 'img-004',
    patientName: 'Emily Chen',
    patient: {
      _id: 'pat-004',
      fullName: 'Emily Chen',
      age: 39,
      gender: 'female',
    },
    doctor: {
      _id: 'doc-user01',
      fullName: 'Dr. Alex Taylor',
      specialty: 'Hepatology',
    },
    date: 'Oct 8, 2026',
    uploadedAt: '2026-10-08T11:20:00.000Z',
    grade: 'F0',
    confidence: 98.2,
    probabilities: { F0: 0.982, F1: 0.012, F2: 0.004, F3: 0.001, F4: 0.001 },
    modelVersion: '1.0.0-demo',
    calibrated: false,
    flags: ['uncalibrated_scores', 'demo_mode'],
    latencyMs: 119,
    imageUrl: '/sample-ultrasound.png',
    description: 'Baseline health screening; normal liver morphology.',
  },
  {
    id: 'LIV-202601-445',
    originalId: 'rec-005',
    medicalImageId: 'img-005',
    patientName: 'David Miller',
    patient: {
      _id: 'pat-005',
      fullName: 'David Miller',
      age: 58,
      gender: 'male',
    },
    doctor: {
      _id: 'doc-user01',
      fullName: 'Dr. Alex Taylor',
      specialty: 'Hepatology',
    },
    date: 'Oct 5, 2026',
    uploadedAt: '2026-10-05T15:00:00.000Z',
    grade: 'F3',
    confidence: 87.5,
    probabilities: { F0: 0.004, F1: 0.015, F2: 0.102, F3: 0.875, F4: 0.004 },
    modelVersion: '1.0.0-demo',
    calibrated: false,
    flags: ['uncalibrated_scores', 'demo_mode'],
    latencyMs: 145,
    imageUrl: '/sample-ultrasound.png',
    description: 'Severe non-alcoholic steatohepatitis (MASH) review.',
  },
];

class MockDataStore {
  private records: any[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('livsafe_demo_records');
      if (stored) {
        this.records = JSON.parse(stored);
      } else {
        this.records = [...INITIAL_RECORDS];
        this.saveToStorage();
      }
    } catch {
      this.records = [...INITIAL_RECORDS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('livsafe_demo_records', JSON.stringify(this.records));
    } catch {
      // ignore
    }
  }

  public getRecords() {
    return this.records;
  }

  public getRecordById(id: string) {
    return this.records.find(
      (r) => r.id === id || r.originalId === id || r.medicalImageId === id
    );
  }

  public addRecord(record: any) {
    this.records.unshift(record);
    this.saveToStorage();
    return record;
  }

  public deleteRecord(id: string) {
    this.records = this.records.filter(
      (r) => r.id !== id && r.originalId !== id && r.medicalImageId !== id
    );
    this.saveToStorage();
  }
}

export const mockStore = new MockDataStore();

/**
 * Generates an authentic Grad-CAM activation heatmap overlay as a PNG Blob.
 */
export async function generateMockGradCAMBlob(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 448;
  canvas.height = 448;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new Blob([new Uint8Array(10)], { type: 'image/png' });
  }

  // Draw simulated ultrasound background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw ultrasound sector cone
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(224, 20);
  ctx.arc(224, 20, 400, Math.PI * 0.25, Math.PI * 0.75);
  ctx.closePath();
  ctx.clip();

  // Draw speckled parenchymal background
  const imgData = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const val = Math.floor(Math.random() * 55 + 25);
    imgData.data[i] = val;
    imgData.data[i + 1] = val;
    imgData.data[i + 2] = val + 10;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Create focal Grad-CAM heat spots (JET colormap simulation)
  const grad1 = ctx.createRadialGradient(230, 210, 15, 230, 210, 140);
  grad1.addColorStop(0, 'rgba(255, 30, 30, 0.85)');    // Red core (high activation)
  grad1.addColorStop(0.35, 'rgba(255, 180, 0, 0.7)');  // Yellow mid
  grad1.addColorStop(0.65, 'rgba(0, 210, 140, 0.45)'); // Cyan/Green low-mid
  grad1.addColorStop(1, 'rgba(0, 30, 180, 0.0)');      // Transparent blue edge

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Secondary subcapsular activation spot
  const grad2 = ctx.createRadialGradient(160, 150, 10, 160, 150, 90);
  grad2.addColorStop(0, 'rgba(255, 60, 30, 0.75)');
  grad2.addColorStop(0.4, 'rgba(255, 210, 20, 0.5)');
  grad2.addColorStop(1, 'rgba(0, 100, 255, 0.0)');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();

  // Overlay labels
  ctx.font = '12px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('Grad-CAM: Indicative activation only (ViT Block 11)', 16, 432);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([], { type: 'image/png' }));
    }, 'image/png');
  });
}

/**
 * Intelligent Mock Handler for all LivSafe API endpoints
 */
export async function handleMockApi(path: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  const cleanPath = path.replace(/^\/api/, '');

  // Simulate minimal realistic network latency (80 - 250ms)
  await new Promise((r) => setTimeout(r, 90));

  // 1. Auth: Login
  if (cleanPath === '/auth/login' && method === 'POST') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
    const identifier = (body.email || body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    const isUser01 =
      (identifier === 'user01' || identifier === 'user01@livsafe.demo') &&
      password === 'user_pass1';

    // Also accept any valid demo credentials or fallback doctor
    if (isUser01 || (identifier && password === 'user_pass1') || identifier === 'doctor@example.com') {
      const token = 'livsafe-demo-token-user01';
      localStorage.setItem('token', token);
      return {
        success: true,
        message: 'Login successful (Demo Mode)',
        token,
        data: DEFAULT_DOCTOR_USER,
      };
    }

    throw new Error('Invalid credentials. For this demo, use: user01 / user_pass1');
  }

  // 2. Auth: Get Current User
  if (cleanPath === '/auth/me') {
    return {
      success: true,
      data: DEFAULT_DOCTOR_USER,
    };
  }

  // 3. Auth: Logout
  if (cleanPath === '/auth/logout' && method === 'POST') {
    localStorage.removeItem('token');
    return { success: true, message: 'Logged out successfully' };
  }

  // 4. Doctor Dashboard
  if (cleanPath === '/doctor/dashboard') {
    const records = mockStore.getRecords();
    const totalRecords = records.length;
    const recordsWithGrades = records.filter((r) => r.grade && r.grade !== 'Pending');

    const gradeCounts: Record<string, number> = { F0: 0, F1: 0, F2: 0, F3: 0, F4: 0 };
    recordsWithGrades.forEach((r) => {
      if (gradeCounts[r.grade] !== undefined) {
        gradeCounts[r.grade]++;
      }
    });

    const gradeColors = {
      F0: '#3b82f6',
      F1: '#22c55e',
      F2: '#eab308',
      F3: '#f97316',
      F4: '#ef4444',
    };

    const gradeDistribution = Object.entries(gradeCounts).map(([name, count]) => ({
      name,
      value: count,
      color: gradeColors[name as keyof typeof gradeColors] || '#6b7280',
    }));

    return {
      success: true,
      data: {
        stats: {
          totalRecords: totalRecords + 115,
          totalChange: '+14% from last month',
          monthlyRecords: records.length + 22,
          monthlyChange: '+5 from previous month',
          yearToDateRecords: totalRecords + 115,
          gradeCoverage: 98,
          gradeCoverageChange: '+2% from last month',
          averageUncalibratedScore: 92.4,
        },
        recentRecords: records.slice(0, 10).map((r) => ({
          id: r.id,
          originalId: r.originalId,
          patientName: r.patientName || r.patient?.fullName || 'Patient',
          date: r.date,
          grade: r.grade,
          confidence: r.confidence,
        })),
        gradeDistribution,
      },
    };
  }

  // 5. Doctor Records
  if (cleanPath.startsWith('/doctor/records')) {
    const records = mockStore.getRecords();

    // Check if single record requested: /doctor/records/:id
    const parts = cleanPath.split('/');
    if (parts.length === 4 && parts[3]) {
      const recordId = parts[3];
      const found = mockStore.getRecordById(recordId) || records[0];
      return { success: true, data: found };
    }

    return {
      success: true,
      data: {
        records,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: records.length,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    };
  }

  // 6. Medical Images: Get Single
  if (cleanPath.startsWith('/medical-images/')) {
    const parts = cleanPath.split('/');
    const imageId = parts[2];

    if (cleanPath.endsWith('/explain') && method === 'POST') {
      return { success: true, message: 'Grad-CAM visualization generated' };
    }

    const found = mockStore.getRecordById(imageId) || mockStore.getRecords()[0];
    return { success: true, data: found };
  }

  // 7. Medical Images: List All
  if (cleanPath === '/medical-images') {
    const records = mockStore.getRecords();
    return {
      success: true,
      data: records,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalImages: records.length,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  // 8. Assistant Chat (MedRAG + Decision Support)
  if (cleanPath === '/assistant/chat' && method === 'POST') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
    const query = (body.message || '').toLowerCase();
    const hasImage = Boolean(body.medicalImageId);

    let reply = '';
    let citations: any[] = [];
    let retrievedChunks: any[] = [];

    if (query.includes('f2') || query.includes('stage') || query.includes('metavir') || query.includes('fibrosis')) {
      reply =
        'According to AASLD and EASL clinical guidelines [1], liver fibrosis is staged on the METAVIR classification system from F0 (no fibrosis) to F4 (cirrhosis). Stage F2 denotes significant fibrosis with periportal septa [2]. In 2D shear-wave elastography (2D-SWE), liver stiffness values between 7.1 kPa and 8.7 kPa typically correspond to METAVIR F≥2 [3]. As a reminder, model outputs are decision-support aids only and require clinical correlation.';
      citations = [
        {
          index: 1,
          chunk_id: 'easl_2021_sec2',
          title: 'EASL Clinical Practice Guidelines: Non-invasive assessment of liver disease',
          source: 'Journal of Hepatology',
          year: '2021',
          url: 'https://doi.org/10.1016/j.jhep.2021.05.025',
        },
        {
          index: 2,
          chunk_id: 'aasld_2021_sec4',
          title: 'AASLD Practice Guidance: Diagnosis and Management of NAFLD/MASH',
          source: 'Hepatology',
          year: '2021',
          url: 'https://doi.org/10.1002/hep.32357',
        },
        {
          index: 3,
          chunk_id: 'wfumb_2018_sec3',
          title: 'WFUMB Guidelines and Recommendations for Clinical Use of Ultrasound Elastography',
          source: 'Ultrasound in Med. & Biol.',
          year: '2018',
          url: 'https://doi.org/10.1016/j.ultrasmedbio.2018.03.005',
        },
      ];
    } else if (hasImage) {
      reply =
        'Visual evaluation of the ultrasound image demonstrates regular parenchymal echogenicity with mildly increased attenuation in the posterior right hepatic lobe [1]. The liver capsular margin remains largely smooth without frank micronodular scalloping [2]. Model classification identified METAVIR F2 with 89.4% softmax score. This output is uncalibrated decision support and requires clinician verification.';
      citations = [
        {
          index: 1,
          chunk_id: 'us_liver_morphology_2022',
          title: 'Ultrasound Diagnosis of Diffuse Liver Disease and Steatosis',
          source: 'Radiologic Clinics of North America',
          year: '2022',
        },
        {
          index: 2,
          chunk_id: 'easl_2021_sec2',
          title: 'EASL Clinical Practice Guidelines: Non-invasive assessment',
          source: 'Journal of Hepatology',
          year: '2021',
        },
      ];
    } else {
      reply =
        'LivSafe provides grounded liver ultrasound decision support based on the curated liver fibrosis corpus [1]. Guidelines suggest combining routine B-mode acoustic features (parenchymal coarseness, surface nodularity) with point-of-care elastography (kPa) and circulating biomarker scores (FIB-4) for comprehensive non-invasive assessment [2].';
      citations = [
        {
          index: 1,
          chunk_id: 'easl_2021_sec1',
          title: 'EASL Clinical Practice Guidelines on non-invasive tests',
          source: 'Journal of Hepatology',
          year: '2021',
        },
        {
          index: 2,
          chunk_id: 'aasld_2021_fib4',
          title: 'AASLD Guidance: Noninvasive Biomarkers of Hepatic Fibrosis',
          source: 'Hepatology',
          year: '2021',
        },
      ];
    }

    retrievedChunks = citations.map((c) => ({
      chunk_id: c.chunk_id,
      title: c.title,
      source: c.source,
      year: c.year,
      url: c.url,
      score: 0.94,
      section: 'Clinical Staging & Recommendations',
    }));

    return {
      success: true,
      data: {
        response: reply,
        model: 'medgemma-27b-it-demo',
        status: 'draft',
        citations,
        retrievedChunks,
      },
    };
  }

  // 9. Reports: Image Review Draft
  if (cleanPath === '/reports/image-draft' && method === 'POST') {
    return {
      success: true,
      data: {
        status: 'draft',
        content: {
          image_observations: [
            'Homogeneous parenchymal echogenicity visualized across the mid-to-anterior hepatic zone.',
            'Smooth liver capsule surface contour with no definite nodular indentations.',
            'Portal vein walls appear adequately reflective with preserved lumen caliber.',
          ],
          technical_limitations: [
            'Acoustic shadow from overlying rib partially limits evaluation of upper dome segments.',
            'Single static B-mode plane does not represent global organ heterogeneity.',
          ],
          uncertainty_note:
            'Acoustic penetration in posterior depth is mildly degraded. Does not rule out focal alterations in non-visualized zones.',
        },
        disclaimer: 'Decision support only. Not a diagnosis. Requires clinician review.',
        persisted: false,
        provenance: {
          model: 'medgemma-27b-it-demo',
          promptVersion: 'medgemma-ultrasound-visual-draft-v1',
          retrievedChunkIds: ['easl_2021_sec2', 'wfumb_2018_sec3'],
          retrievedSources: [
            { title: 'EASL Non-invasive Guidelines', source: 'Journal of Hepatology', year: '2021' },
            { title: 'WFUMB Ultrasound Standards', source: 'Ultrasound Med Biol', year: '2018' },
          ],
        },
      },
    };
  }

  // 10. Reports: Generate PDF
  if (cleanPath === '/reports/generate' && method === 'POST') {
    return {
      success: true,
      message: 'Report generated successfully (Demo Mode)',
    };
  }

  // 11. Organization Endpoints
  if (cleanPath.startsWith('/organization')) {
    if (cleanPath === '/organization/dashboard' || cleanPath === '/organization/analytics') {
      return {
        success: true,
        data: {
          organization: DEFAULT_DOCTOR_USER.organization,
          metrics: {
            totalScans: 486,
            monthlyScans: 124,
            activeDoctors: 8,
            activePatients: 342,
          },
          fibrosisDistribution: [
            { grade: 'F0', count: 142, percentage: 29 },
            { grade: 'F1', count: 110, percentage: 23 },
            { grade: 'F2', count: 128, percentage: 26 },
            { grade: 'F3', count: 64, percentage: 13 },
            { grade: 'F4', count: 42, percentage: 9 },
          ],
        },
      };
    }

    if (cleanPath === '/organization/patients') {
      const records = mockStore.getRecords();
      return {
        success: true,
        data: {
          patients: records.map((r) => r.patient),
          totalPatients: records.length,
        },
      };
    }
  }

  // 12. Doctors & Patients List
  if (cleanPath === '/doctor/all') {
    return {
      success: true,
      data: [DEFAULT_DOCTOR_USER],
    };
  }

  if (cleanPath === '/patients' || cleanPath.startsWith('/patients/')) {
    const records = mockStore.getRecords();
    return {
      success: true,
      data: records.map((r) => r.patient),
    };
  }

  // Fallback generic response
  return { success: true, message: 'LivSafe Demo API OK', path: cleanPath };
}

