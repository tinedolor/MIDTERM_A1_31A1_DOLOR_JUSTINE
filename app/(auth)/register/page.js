'use client';
import AuthForm from '../../../components/AuthForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative">
        {/* Return Button */}
        <Link 
          href="/" 
          className="absolute -top-12 left-0 flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Return to Home
        </Link>
        
        <AuthForm isLogin={false} />
      </div>
    </div>
  );
}