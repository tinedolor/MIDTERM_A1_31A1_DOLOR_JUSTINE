import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to Slot Machine</h1>
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/register" 
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          Register
        </Link>
      </div>
    </main>
  );
}