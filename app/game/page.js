'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaGem, FaHeart, FaLaptopCode, FaQuestion, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Spinning messages array
const spinningMessages = [
  "Spinning... This could be your lucky compile!",
  "Spinning... Will your code execute correctly?",
  "Spinning... Debugging your luck!",
  "Spinning... Optimizing for a win!",
  "Spinning... Crossing fingers for no infinite loop!",
  "Spinning... Are you a computer science genius?",
  "Spinning... Hope you don't hit a bug!",
  "Spinning... Will you make it past the first condition?",
  "Spinning... 3, 2, 1... Success?",
  "Spinning... Can you break the recursion?"
];

// Game over messages array
const gameOverMessages = [
  "Oops! Looks like your code threw an error. Game Over!",
  "Your algorithm failed... Better luck next time!",
  "Looks like you hit a segmentation fault. Game Over!",
  "Compile error! Try again!",
  "This is the equivalent of a 404... Game Over!",
  "You've been debugged... by failure.",
  "Oops! Infinite loop... in the wrong direction. Game Over!",
  "Game Over, but at least you didn't get caught in an endless recursion.",
  "404: Success Not Found. Try again!",
  "Better luck next time, your code ran out of retries!"
];

// Game symbols configuration
const symbols = [
  { icon: <FaStar className="text-yellow-400" />, name: 'Star' },
  { icon: <FaGem className="text-blue-400" />, name: 'Gem' },
  { icon: <FaHeart className="text-red-400" />, name: 'Heart' },
  { icon: <FaLaptopCode className="text-green-400" />, name: 'Code' },
  { icon: <FaQuestion className="text-red-400" />, name: 'Question' },
];

// Helper function to get random symbol
const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

// Confetti component for winning celebration
const Confetti = () => {
  const pieces = new Array(30).fill(0);
  const colors = ["#FFC700", "#FF0000", "#2E3192", "#41BBC7"];
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {pieces.map((_, index) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        const size = 5 + Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.div
            key={index}
            className="absolute rounded-full"
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, window.innerHeight * 1.2],
              rotate: [0, 360]
            }}
            transition={{ duration, delay, ease: "easeInOut" }}
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
};

// Main game component
export default function GamePage() {
  const router = useRouter();
  const [reels, setReels] = useState([
    getRandomSymbol(),
    getRandomSymbol(),
    getRandomSymbol(),
  ]);
  const [spinning, setSpinning] = useState(false);
  const [winSound, setWinSound] = useState(null);
  const [spinSound, setSpinSound] = useState(null);
  const [gameOverSound, setGameOverSound] = useState(null);
  const [bgMusic, setBgMusic] = useState(null);
  const [remainingRetries, setRemainingRetries] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [hasWon, setHasWon] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Initialize game and audio
  useEffect(() => {
    // Get student number from localStorage
    const storedStudentNumber = localStorage.getItem('studentNumber');
    if (storedStudentNumber) {
      setStudentNumber(storedStudentNumber);
      checkSpinAvailability(storedStudentNumber);
    }

    // Initialize audio
    const winAudio = new Audio('/win.wav');
    const spinAudio = new Audio('/spin.wav');
    const gameOverAudio = new Audio('/game-over.wav');
    const bgAudio = new Audio('/intro.wav');
    bgAudio.loop = true;
    
    setWinSound(winAudio);
    setSpinSound(spinAudio);
    setGameOverSound(gameOverAudio);
    setBgMusic(bgAudio);

    // Handle first interaction for audio autoplay
    const handleFirstInteraction = () => {
      bgAudio.play().catch(e => console.log("Audio play prevented:", e));
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);

    // Cleanup
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      bgAudio.pause();
    };
  }, []);

  // Check spin availability from backend
  const checkSpinAvailability = async (studentNumber) => {
    try {
      const response = await fetch(
        `http://localhost:5260/api/Players/${studentNumber}/spin-availability`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check spin availability');
      }

      const data = await response.json();
      setRemainingRetries(data.retriesRemaining);
      setCooldownEndTime(data.cooldownEndTime ? new Date(data.cooldownEndTime) : null);
    } catch (error) {
      console.error("Error checking spin availability:", error);
      setStatusMessage("Error checking your spin availability");
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!cooldownEndTime) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const diffMs = cooldownEndTime - now;
      
      if (diffMs <= 0) {
        setTimeLeft('');
        if (studentNumber) {
          checkSpinAvailability(studentNumber);
        }
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [cooldownEndTime, studentNumber]);

  // Record game result to backend
  const recordGameResult = async (isWin) => {
    try {
      const response = await fetch('http://localhost:5260/api/Players/record-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          StudentNumber: studentNumber,
          IsWin: isWin,
          RetriesUsed: 1 // We're deducting 1 retry per spin
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record game result');
      }

      const data = await response.json();
      console.log('Game result recorded:', data);
      
      // Update local state based on response
      setRemainingRetries(data.retriesRemaining);
      setCooldownEndTime(data.cooldownEndTime ? new Date(data.cooldownEndTime) : null);
      
      // Update local win/loss counts
      if (isWin) {
        setWinCount(prev => prev + 1);
      } else {
        setLossCount(prev => prev + 1);
      }

      return data;
    } catch (error) {
      console.error('Error recording game result:', error);
      throw error;
    }
  };

  // Play win sound
  const playWinSound = () => {
    winSound?.play().catch(e => console.log("Win sound error:", e));
  };

  // Play spin sound
  const playSpinSound = () => {
    spinSound?.play().catch(e => console.log("Spin sound error:", e));
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('studentNumber');
    router.push('/');
  };

  // Main spin function
  const spin = async () => {
    if (spinning || remainingRetries === 0) return;
    
    setSpinning(true);
    setStatusMessage(spinningMessages[Math.floor(Math.random() * spinningMessages.length)]);
    playSpinSound();
    
    const spinDuration = 2000;
    const interval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 100);
    
    setTimeout(async () => {
      clearInterval(interval);
      
      // Determine final reels (for consistent win/loss during demo)
      const finalReels = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
      ];
      
      // For demo purposes, let's make the first spin a win and others random
      let isWin;
      if (winCount === 0 && lossCount === 0) {
        // First spin is guaranteed win for demo
        isWin = true;
        setReels([symbols[0], symbols[0], symbols[0]]); // All same symbol
      } else {
        // Subsequent spins are random
        isWin = Math.random() > 0.9; // 30% chance to win
        if (isWin) {
          const winningSymbol = getRandomSymbol();
          setReels([winningSymbol, winningSymbol, winningSymbol]);
        } else {
          setReels(finalReels);
        }
      }
      
      try {
        // Record game result and get updated retries
        const result = await recordGameResult(isWin);
        
        setSpinning(false);
        
        if (isWin) {
          playWinSound();
          setStatusMessage('Congratulations! You win!');
          setHasWon(true);
        } else {
          if (result.retriesRemaining === 0) {
            gameOverSound?.play().catch(e => console.log("Game over sound error:", e));
            setStatusMessage(gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)]);
          } else {
            setStatusMessage('Try again?');
          }
        }
      } catch (error) {
        setSpinning(false);
        setStatusMessage('Error recording game result. Please try again.');
      }
    }, spinDuration);
  };

  // Reset game function
  const resetGame = () => {
    setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    setStatusMessage('');
    setHasWon(false);
    bgMusic?.play().catch(e => console.log("Music restart error:", e));
  };

  return (
    <ProtectedRoute>
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
        {/* Header with student info and actions */}
        <div className="absolute top-4 right-4 flex gap-4 items-center">
          <div className="bg-blue-600 px-4 py-2 rounded-lg">
            Student: {studentNumber || 'Unknown'}
          </div>
          <div className="bg-green-600 px-4 py-2 rounded-lg">
            Wins: {winCount} | Losses: {lossCount}
          </div>
          
          {/* Game History Button */}
          <Link
            href="/history"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <FaHistory /> History
          </Link>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors flex items-center gap-2"
            aria-label="Logout"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* Game title */}
        <h1 className="text-4xl font-bold mb-6">Code Slot Machine</h1>
        
        {/* Reels display */}
        <div className="flex space-x-4 bg-gray-700 p-6 rounded-lg shadow-lg border-4 border-yellow-500 mb-8">
          {reels.map((reel, index) => (
            <motion.div
              key={index}
              className="text-6xl"
              animate={{ rotate: spinning ? 360 : 0 }}
              transition={spinning ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : {}}
            >
              {reel.icon}
            </motion.div>
          ))}
        </div>
        
        {/* Spin button */}
        <div className="mb-6">
          {hasWon ? (
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl shadow-lg text-lg font-bold transition-all duration-300"
            >
              Play Again
            </button>
          ) : remainingRetries > 0 ? (
            <button
              onClick={spin}
              disabled={spinning}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl shadow-lg text-lg font-bold transition-all duration-300 disabled:opacity-50"
            >
              {spinning ? 'Spinning...' : `Spin (${remainingRetries} left)`}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                disabled
                className="px-6 py-3 bg-gray-500 text-black rounded-xl shadow-lg text-lg font-bold"
              >
                No spins left
              </button>
              {timeLeft && (
                <p className="text-yellow-400">
                  Next spin available in: {timeLeft}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Status message */}
        {statusMessage && (
          <p className="mt-4 text-lg text-center max-w-md bg-gray-700 p-4 rounded-lg">
            {statusMessage}
          </p>
        )}
        
        {/* Confetti effect for wins */}
        {hasWon && <Confetti />}
        
        {/* Game instructions */}
        <div className="mt-8 bg-gray-700 p-4 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">How to Play</h2>
          <p className="mb-2">• Click SPIN to start the slot machine</p>
          <p className="mb-2">• Match 3 symbols to win</p>
          <p>• You get 3 retries every 3 hours</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}