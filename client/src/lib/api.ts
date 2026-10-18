import {
  handleMockApi,
  generateMockGradCAMBlob,
  mockStore,
  DEFAULT_DOCTOR_USER,
} from './mockBackend';

// API Base URL (retained for backward compatibility or optional external proxy)
const API_BASE_URL = '/api';

/**
 * Universal API caller for LivSafe Demo.
 * Routes requests to the local mock backend engine without requiring external servers or databases.
 */
const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const data = await handleMockApi(url, options);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
    }

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiCall('/auth/me');
    return response.data;
  },

  logout: async () => {
    await apiCall('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    return { message: 'Logged out successfully' };
  },

  completeOAuthProfile: async (payload: any) => {
    return { success: true, message: 'Profile completed (Demo Mode)', data: DEFAULT_DOCTOR_USER };
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return { success: true, message: 'Password updated successfully (Demo Mode)' };
  },

  signupDoctor: async (data: any) => {
    const token = 'livsafe-demo-token-user01';
    localStorage.setItem('token', token);
    return { success: true, message: 'Account created (Demo Mode)', token, data: DEFAULT_DOCTOR_USER };
  },

  signupOrganization: async (data: any) => {
    const token = 'livsafe-demo-token-user01';
    localStorage.setItem('token', token);
    return { success: true, message: 'Organization created (Demo Mode)', token, data: DEFAULT_DOCTOR_USER };
  },
};

export const doctorAPI = {
  getDashboard: async () => {
    const response = await apiCall('/doctor/dashboard');
    return response.data;
  },

  getRecords: async (page = 1, limit = 10) => {
    const response = await apiCall(`/doctor/records?page=${page}&limit=${limit}`);
    return response.data;
  },

  getRecord: async (id: string) => {
    const response = await apiCall(`/doctor/records/${id}`);
    return response.data;
  },

  createRecord: async (formData: FormData) => {
    const patientName = (formData.get('patientName') as string) || 'Anonymous Patient';
    const patientAge = parseInt((formData.get('patientAge') as string) || '45', 10);
    const patientGender = (formData.get('patientGender') as string) || 'unknown';
    const description = (formData.get('description') as string) || 'Ultrasound scan analysis';
    const imageFile = formData.get('image') as File | null;

    let imageUrl = '/sample-ultrasound.png';
    if (imageFile && typeof window !== 'undefined' && window.URL) {
      try {
        imageUrl = URL.createObjectURL(imageFile);
      } catch {
        imageUrl = '/sample-ultrasound.png';
      }
    }

    // Realistic simulated ViT output
    const uniqueSuffix = Math.floor(100 + Math.random() * 900);
    const recordId = `LIV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${uniqueSuffix}`;
    const newImageId = `img-demo-${Date.now()}`;

    // Select realistic METAVIR stage (e.g. F2 significant fibrosis)
    const grade: 'F0' | 'F1' | 'F2' | 'F3' | 'F4' = 'F2';
    const probabilities = {
      F0: 0.02,
      F1: 0.08,
      F2: 0.885,
      F3: 0.012,
      F4: 0.003,
    };
    const confidence = 88.5;

    const newRecord = {
      id: recordId,
      originalId: newImageId,
      medicalImageId: newImageId,
      patientName,
      patient: {
        _id: `pat-${Date.now()}`,
        fullName: patientName,
        age: patientAge,
        gender: patientGender,
      },
      doctor: {
        _id: DEFAULT_DOCTOR_USER.id,
        fullName: DEFAULT_DOCTOR_USER.fullName,
        specialty: DEFAULT_DOCTOR_USER.specialty,
      },
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      uploadedAt: new Date().toISOString(),
      grade,
      confidence,
      probabilities,
      modelVersion: '1.0.0-vit-b16-demo',
      calibrated: false,
      flags: ['uncalibrated_scores', 'demo_mode'],
      latencyMs: 138,
      imageUrl,
      description,
    };

    mockStore.addRecord(newRecord);

    return {
      id: recordId,
      medicalImage: newRecord,
      medicalImageId: newImageId,
      analysis: {
        status: 'completed',
        grade,
        confidence,
        probabilities,
        modelVersion: '1.0.0-vit-b16-demo',
        calibrated: false,
        flags: ['uncalibrated_scores', 'demo_mode'],
        latencyMs: 138,
      },
    };
  },

  getAllDoctors: async () => {
    const response = await apiCall('/doctor/all');
    return response.data;
  },

  assignPatientToDoctor: async (doctorId: string, patientId: string) => {
    return { success: true, message: 'Patient assigned successfully' };
  },

  deleteRecord: async (id: string) => {
    mockStore.deleteRecord(id);
    return { success: true, message: 'Record deleted successfully' };
  },
};

export const medicalImagesAPI = {
  getImage: async (id: string) => {
    const response = await apiCall(`/medical-images/${id}`);
    return response.data;
  },

  getAllImages: async (page = 1, limit = 10) => {
    const response = await apiCall(`/medical-images?page=${page}&limit=${limit}`);
    return response.data;
  },

  uploadImage: async (formData: FormData) => {
    return doctorAPI.createRecord(formData);
  },

  explainImage: async (id: string): Promise<Blob> => {
    // Generate authentic Grad-CAM activation heatmap overlay as a PNG blob
    return generateMockGradCAMBlob();
  },

  deleteImage: async (id: string) => {
    mockStore.deleteRecord(id);
    return { success: true, message: 'Image deleted' };
  },
};

export const assistantAPI = {
  chat: async (payload: {
    message: string;
    messages?: Array<{ type?: 'user' | 'ai'; content?: string; isAnalysis?: boolean }>;
    medicalImageId?: string;
  }) => {
    const response = await apiCall('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.data;
  },
};

export const reportsAPI = {
  generateImageDraft: async (medicalImageId: string) => {
    const response = await apiCall('/reports/image-draft', {
      method: 'POST',
      body: JSON.stringify({ medicalImageId }),
    });

    return response.data;
  },
};

export const organizationAPI = {
  getCurrentUser: async () => {
    const response = await apiCall('/auth/me');
    return response.data;
  },

  getDashboard: async () => {
    const response = await apiCall('/organization/dashboard');
    return response.data;
  },

  getAnalytics: async (timeRange = '30') => {
    const response = await apiCall(`/organization/analytics?timeRange=${timeRange}`);
    return response.data;
  },

  getPatients: async (page = 1, limit = 50, search = '') => {
    const response = await apiCall(`/organization/patients?page=${page}&limit=${limit}&search=${search}`);
    return response;
  },

  getDoctors: async () => {
    const response = await apiCall('/doctor/all');
    return response.data;
  },

  addDoctor: async (organizationId: string, doctorData: any) => {
    return { success: true, message: 'Doctor added successfully (Demo Mode)' };
  },

  removeDoctor: async (organizationId: string, doctorId: string) => {
    return { success: true, message: 'Doctor removed successfully (Demo Mode)' };
  },

  getAllOrganizations: async () => {
    return [DEFAULT_DOCTOR_USER.organization];
  },

  getOrganization: async (id: string) => {
    return DEFAULT_DOCTOR_USER.organization;
  },

  updateOrganization: async (id: string, data: any) => {
    return { success: true, message: 'Organization updated (Demo Mode)' };
  },
};

export const patientAPI = {
  getPatients: async (page = 1, limit = 10, search = '') => {
    const response = await apiCall(`/patients?page=${page}&limit=${limit}&search=${search}`);
    return response;
  },

  getPatient: async (id: string) => {
    const response = await apiCall(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (patientData: any) => {
    return { success: true, data: { _id: `pat-${Date.now()}`, ...patientData } };
  },

  updatePatient: async (id: string, patientData: any) => {
    return { success: true, data: { _id: id, ...patientData } };
  },

  deletePatient: async (id: string) => {
    return { success: true, message: 'Patient removed' };
  },

  searchPatients: async (query: string, filters?: any) => {
    const response = await apiCall(`/patients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
