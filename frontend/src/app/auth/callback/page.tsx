'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetchUserData(token);
    } else {
      setStatus('error');
      setMessage('No authentication token received.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  }, [searchParams, router]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        setStatus('success');
        setMessage('Authentication successful! Redirecting to dashboard...');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to fetch user data. Please try again.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Completing authentication...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your sign-in.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back!
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication failed
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 