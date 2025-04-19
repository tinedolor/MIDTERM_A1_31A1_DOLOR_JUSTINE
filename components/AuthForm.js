'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ isLogin }) {
  const [studentNumber, setStudentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateStudentNumber = (number) => {
    if (!number || number.length < 2 || number[0] !== 'C') return false;
    return number.substring(1).split('').every(char => !isNaN(char));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!validateStudentNumber(studentNumber)) {
        throw new Error('Student number must start with C followed by numbers');
      }

      if (isLogin) {
        // Login logic
        const response = await fetch(`http://localhost:5260/api/Players/validate?studentNumber=${studentNumber}`);
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        if (!data.isValid) throw new Error('Student number not registered');
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('studentNumber', studentNumber);
        router.push('/history');
      } else {
        // Registration logic
        if (!firstName || !lastName) throw new Error('First and last name are required');
        
        const response = await fetch('http://localhost:5260/api/Players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentNumber,
            firstName: firstName.trim(),
            lastName: lastName.trim()
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('studentNumber', studentNumber);
        router.push('/history');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      {error && (
        <p className="text-red-400 mb-4 text-sm">{error}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2" htmlFor="studentNumber">
            Student Number (C followed by numbers)
          </label>
          <input
            id="studentNumber"
            type="text"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            pattern="C\d+"
            title="Must start with C followed by numbers"
          />
        </div>
        
        {!isLogin && (
          <>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isLogin}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isLogin}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
            isLoading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
}