import React, { useState } from 'react';
import { authAPI, organizationAPI } from '@/lib/api';
import { debugAuth } from '@/utils/debug-auth';

const AuthTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => setResults([]);

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      addResult('🔗 Testing direct API call...');
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      addResult(`🌐 API URL: ${apiUrl}`);
      addResult(`🔑 Using token: ${token ? 'YES' : 'NO'}`);
      
      const response = await fetch(`${apiUrl}/organization/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      addResult(`📊 Response status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      addResult(`📄 Response body: ${responseText}`);
      
      if (response.ok) {
        addResult('✅ Direct API call SUCCESS');
      } else {
        addResult('❌ Direct API call FAILED');
      }
    } catch (error: any) {
      addResult(`💥 Direct API error: ${error.message}`);
    }
    setLoading(false);
  };

  const testAuth = async () => {
    setLoading(true);
    clearResults();
    
    try {
      addResult('🔍 Starting auth tests...');
      
      // Check localStorage token
      const token = localStorage.getItem('token');
      addResult(`📝 Token in localStorage: ${token ? 'EXISTS' : 'MISSING'}`);
      
      if (token) {
        addResult(`🔑 Token preview: ${token.substring(0, 30)}...`);
        
        // Test /auth/me endpoint
        try {
          addResult('📞 Testing /auth/me endpoint...');
          const userData = await authAPI.getCurrentUser();
          addResult(`✅ /auth/me SUCCESS: ${JSON.stringify(userData)}`);
        } catch (error: any) {
          addResult(`❌ /auth/me FAILED: ${error.message}`);
        }
        
        // Test organization dashboard endpoint
        try {
          addResult('📞 Testing /organization/dashboard endpoint...');
          const dashboardData = await organizationAPI.getDashboard();
          addResult(`✅ /organization/dashboard SUCCESS: ${JSON.stringify(dashboardData)}`);
        } catch (error: any) {
          addResult(`❌ /organization/dashboard FAILED: ${error.message}`);
        }
      }
      
      addResult('🏁 Auth tests completed');
    } catch (error: any) {
      addResult(`💥 Unexpected error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const manualLogin = async () => {
    setLoading(true);
    try {
      addResult('🔐 Attempting manual login...');
      const userData = await authAPI.login('test@test.com', 'password');
      addResult(`✅ Login SUCCESS: ${JSON.stringify(userData)}`);
    } catch (error: any) {
      addResult(`❌ Login FAILED: ${error.message}`);
    }
    setLoading(false);
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    addResult('🗑️ Token removed from localStorage');
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">🔧 Auth Debug Panel</h3>
        <button 
          onClick={() => document.getElementById('auth-test')?.remove()}
          className="text-gray-500 hover:text-gray-700"
        >
          ✖️
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <button 
          onClick={testAuth} 
          disabled={loading}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '⏳ Testing...' : '🧪 Test Auth Status'}
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={manualLogin}
            disabled={loading}
            className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            🔐 Test Login
          </button>
          
          <button 
            onClick={clearToken}
            className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            🗑️ Clear Token
          </button>
        </div>
        
        <button 
          onClick={() => { debugAuth(); addResult('🔍 Debug info logged to console'); }}
          className="w-full bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
        >
          🔍 Debug to Console
        </button>
        
        <button 
          onClick={testDirectAPI}
          disabled={loading}
          className="w-full bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
        >
          🔗 Test API Direct
        </button>
        
        <button 
          onClick={clearResults}
          className="w-full bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
        >
          🧹 Clear Results
        </button>
      </div>
      
      <div className="bg-gray-100 border rounded p-2 max-h-48 overflow-y-auto">
        <div className="text-xs text-gray-600 font-mono">
          {results.length === 0 ? (
            <div className="text-center text-gray-400">Click "Test Auth Status" to begin</div>
          ) : (
            results.map((result, index) => (
              <div key={index} className="mb-1 break-words">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
