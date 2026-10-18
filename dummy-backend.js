/**
 * LivSafe Demo - Standalone Dummy Backend Server
 * 
 * Powered by native Node.js HTTP (no extra dependencies required).
 * Default Auth:
 *   Username: user01
 *   Password: user_pass1
 * 
 * Usage:
 *   node dummy-backend.js
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5000;

const DEFAULT_USER = {
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

const records = [
  {
    id: 'LIV-202601-842',
    originalId: 'rec-001',
    medicalImageId: 'img-001',
    patientName: 'John Doe',
    patient: { _id: 'pat-001', fullName: 'John Doe', age: 54, gender: 'male' },
    doctor: { _id: 'doc-user01', fullName: 'Dr. Alex Taylor', specialty: 'Hepatology' },
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
  },
  {
    id: 'LIV-202601-791',
    originalId: 'rec-002',
    medicalImageId: 'img-002',
    patientName: 'Maria Santos',
    patient: { _id: 'pat-002', fullName: 'Maria Santos', age: 47, gender: 'female' },
    doctor: { _id: 'doc-user01', fullName: 'Dr. Alex Taylor', specialty: 'Hepatology' },
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
  },
  {
    id: 'LIV-202601-630',
    originalId: 'rec-003',
    medicalImageId: 'img-003',
    patientName: 'Robert Johnson',
    patient: { _id: 'pat-003', fullName: 'Robert Johnson', age: 61, gender: 'male' },
    doctor: { _id: 'doc-user01', fullName: 'Dr. Alex Taylor', specialty: 'Hepatology' },
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
  },
];

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const server = http.createServer((req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    let parsedBody = {};
    try {
      if (body) parsedBody = JSON.parse(body);
    } catch (e) {}

    res.setHeader('Content-Type', 'application/json');

    // Health
    if (path === '/health' || path === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', service: 'LivSafe Demo Dummy Backend' }));
      return;
    }

    // Auth Login
    if (path === '/api/auth/login' && req.method === 'POST') {
      const identifier = (parsedBody.email || parsedBody.username || '').toLowerCase().trim();
      const password = (parsedBody.password || '').trim();

      if ((identifier === 'user01' || identifier === 'user01@livsafe.demo') && password === 'user_pass1') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token: 'livsafe-demo-token-user01',
          data: DEFAULT_USER,
        }));
        return;
      }

      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid credentials. Default demo credentials: user01 / user_pass1',
      }));
      return;
    }

    // Auth Me
    if (path === '/api/auth/me') {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: DEFAULT_USER }));
      return;
    }

    // Doctor Dashboard
    if (path === '/api/doctor/dashboard') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: {
          stats: {
            totalRecords: 128,
            totalChange: '+14% from last month',
            monthlyRecords: 32,
            monthlyChange: '+6 from previous month',
            yearToDateRecords: 128,
            gradeCoverage: 98,
            gradeCoverageChange: '+2% from last month',
            averageUncalibratedScore: 92.4,
          },
          recentRecords: records.map((r) => ({
            id: r.id,
            originalId: r.originalId,
            patientName: r.patientName,
            date: r.date,
            grade: r.grade,
            confidence: r.confidence,
          })),
          gradeDistribution: [
            { name: 'F0', value: 34, color: '#3b82f6' },
            { name: 'F1', value: 28, color: '#22c55e' },
            { name: 'F2', value: 32, color: '#eab308' },
            { name: 'F3', value: 18, color: '#f97316' },
            { name: 'F4', value: 16, color: '#ef4444' },
          ],
        },
      }));
      return;
    }

    // Assistant Chat
    if (path === '/api/assistant/chat' && req.method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: {
          response: 'According to AASLD and EASL clinical guidelines [1], liver fibrosis is graded on the METAVIR scale from F0 to F4 [2]. This output is decision support only and requires clinician review.',
          citations: [
            { index: 1, title: 'EASL Clinical Practice Guidelines', source: 'Journal of Hepatology', year: '2021' },
            { index: 2, title: 'AASLD Practice Guidance on NAFLD/MASH', source: 'Hepatology', year: '2021' },
          ],
          model: 'medgemma-27b-it-demo',
        },
      }));
      return;
    }

    // Fallback OK
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, message: 'LivSafe Dummy Backend OK', path }));
  });
});

server.listen(PORT, () => {
  console.log(`🏥 LivSafe Dummy Backend running on http://localhost:${PORT}`);
  console.log(`🔑 Demo User: user01 | Password: user_pass1`);
});

