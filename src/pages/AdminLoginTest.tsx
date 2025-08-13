import React, { useState } from 'react';
import authApi from '../services/authApi';
import toast from 'react-hot-toast';

const AdminLoginTest: React.FC = () => {
  const [email, setEmail] = useState('admin@jjessential.com');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Test login with:', { email, password });
      
      // Direct API call to test
      const response = await authApi.adminSignIn({ email, password });
      console.log('Response:', response);
      setResult(response);
      toast.success('Login successful!');
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMsg = 'Login failed';
      
      if (err.response?.data) {
        errorMsg = JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Admin Login Test</h1>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test Login'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <h3 className="font-bold">Success:</h3>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AdminLoginTest;
