'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const studentNumber = localStorage.getItem('studentNumber');
      
      if (!isAuthenticated || !studentNumber) {
        router.push('/login');
        return;
      }

      try {
        // Update this URL to match your actual API endpoint
        const response = await fetch(
          `http://localhost:5260/api/Players/validate?studentNumber=${studentNumber}`
        );
        
        if (!response.ok) {
          throw new Error('Session validation failed');
        }
        
        const data = await response.json();
        if (!data.isValid) {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('studentNumber');
          router.push('/login');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('studentNumber');
        router.push('/login');
      }
    };

    validateSession();
  }, [router]);

  return children;
}