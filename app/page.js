import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 p-4 relative overflow-hidden">
      {/* Decorative casino-style lights */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      
      {/* Animated background elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl w-full">
        {/* Slot machine styled header */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-yellow-400 font-lucky tracking-wide">
          WELCOME TO SLOT MACHINE GAME
        </h1>
        <p className="text-xl text-gray-300 mb-12 italic">by McJolibog</p>
        
        {/* Slot machine reel decoration */}
        <div className="flex justify-center gap-2 mb-12">
          <div className="w-16 h-24 bg-gray-800 border-2 border-yellow-400 rounded-lg flex items-center justify-center text-4xl">
            🍒
          </div>
          <div className="w-16 h-24 bg-gray-800 border-2 border-yellow-400 rounded-lg flex items-center justify-center text-4xl">
            ⑦
          </div>
          <div className="w-16 h-24 bg-gray-800 border-2 border-yellow-400 rounded-lg flex items-center justify-center text-4xl">
            💎
          </div>
        </div>
        
        {/* Action buttons with casino style */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-lg transition-all 
                      hover:shadow-lg hover:shadow-yellow-500/30 flex items-center justify-center gap-2"
          >
            <span>🎰</span> Player Login
          </Link>
          <Link 
            href="/register" 
            className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-all 
                      hover:shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2"
          >
            <span>🃏</span> Join Game
          </Link>
        </div>
        
        {/* Footer note */}
        <p className="text-gray-400 mt-12 text-sm">
          Ready to spin and win? Try your luck today!
        </p>
      </div>
    </main>
  );
}