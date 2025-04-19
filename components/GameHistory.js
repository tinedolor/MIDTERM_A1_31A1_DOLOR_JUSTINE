'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';

export default function GameHistory() {
  const router = useRouter();
  const [history, setHistory] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winPercentage: 0,
    recentGames: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentNumber, setStudentNumber] = useState('');

  useEffect(() => {
    const storedStudentNumber = localStorage.getItem('studentNumber');
    if (storedStudentNumber) {
      setStudentNumber(storedStudentNumber);
    } else {
      setError("No student number found - please login again");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!studentNumber) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `http://localhost:5260/api/Players/${studentNumber}/game-history/summary`
        );

        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }

        const data = await res.json();
        const transformedData = {
          totalGames: data.totalGames || 0,
          wins: data.wins || 0,
          losses: data.losses || 0,
          winPercentage: data.winPercentage ? parseFloat(data.winPercentage.toFixed(1)) : 0,
          recentGames: Array.isArray(data.recentGames) 
            ? data.recentGames.map(game => ({
                playedAt: game.playedAt ? new Date(game.playedAt) : new Date(),
                result: game.result || 'Unknown',
                retriesUsed: game.retriesUsed || 0,
                status: game.result === "Win" ? "Won" : `Retries: ${game.retriesUsed || 0}`
              }))
            : []
        };

        setHistory(transformedData);
      } catch (err) {
        console.error("Failed to fetch game history:", err);
        setError(err.message || "Failed to load game history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [studentNumber]);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    setStudentNumber(localStorage.getItem('studentNumber') || '');
  };

  const handleLogout = () => {
    localStorage.removeItem('studentNumber');
    localStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  return (
    <div className="game-history-container">
      <div className="header-section">
        <div>
          <h1>Game History</h1>
          {studentNumber && (
            <p className="student-info">Student: {studentNumber}</p>
          )}
        </div>
        <div className="header-actions">
          <Link href="/game" className="play-button">Play Again</Link>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Loading game history...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={retryFetch} className="retry-button">Retry</button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Games</h3>
              <p>{history.totalGames}</p>
            </div>
            <div className="stat-card">
              <h3>Wins</h3>
              <p className="win-text">{history.wins}</p>
            </div>
            <div className="stat-card">
              <h3>Losses</h3>
              <p className="loss-text">{history.losses}</p>
            </div>
            <div className="stat-card">
              <h3>Win Rate</h3>
              <p>{history.winPercentage}%</p>
            </div>
          </div>

          <div className="recent-games-section">
            <h2>Recent Games</h2>
            {history.recentGames.length > 0 ? (
              <ul className="game-list">
                {history.recentGames.map((game, index) => (
                  <li
                    key={index}
                    className={`game-item ${game.result?.toLowerCase() === 'win' ? 'win' : 'loss'}`}
                  >
                    <span className="game-date">
                      {game.playedAt.toLocaleString()}
                    </span>
                    <span className="game-result">
                      {game.result}
                      <span className="game-status">{game.status}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-games">No recent games found</p>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .game-history-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: #2a2a3a;
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .student-info {
          margin: 0.5rem 0 0;
          font-size: 0.9rem;
          color: #b0b0b0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        h1 {
          font-size: 1.8rem;
          margin: 0;
          color: #f0f0f0;
        }

        .play-button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background: #4caf50;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          transition: all 0.2s;
        }

        .play-button:hover {
          background: #3e8e41;
          transform: translateY(-2px);
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-button:hover {
          background: #d32f2f;
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #3a3a4a;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #b0b0b0;
        }

        .stat-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .win-text {
          color: #4caf50;
        }

        .loss-text {
          color: #f44336;
        }

        .recent-games-section h2 {
          font-size: 1.4rem;
          margin-bottom: 1rem;
          color: #f0f0f0;
        }

        .game-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .game-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          margin-bottom: 0.5rem;
          border-radius: 6px;
          background: #3a3a4a;
          transition: transform 0.2s;
        }

        .game-item:hover {
          transform: translateX(5px);
        }

        .game-item.win {
          border-left: 4px solid #4caf50;
        }

        .game-item.loss {
          border-left: 4px solid #f44336;
        }

        .game-date {
          color: #b0b0b0;
          font-size: 0.9rem;
        }

        .game-result {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .game-status {
          font-size: 0.8rem;
          color: #b0b0b0;
        }

        .game-item.win .game-result {
          color: #4caf50;
        }

        .game-item.loss .game-result {
          color: #f44336;
        }

        .no-games {
          color: #b0b0b0;
          text-align: center;
          padding: 2rem;
          border: 1px dashed #4a4a5a;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .no-games svg {
          width: 2rem;
          height: 2rem;
          color: #b0b0b0;
        }

        .loading-spinner {
          text-align: center;
          padding: 2rem;
          color: #b0b0b0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .loading-spinner .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: #4caf50;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          color: #f44336;
          padding: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          background: rgba(244, 67, 54, 0.1);
          border-radius: 8px;
        }

        .error-message svg {
          width: 40px;
          height: 40px;
        }

        .error-message h3 {
          margin: 0;
          font-size: 1.2rem;
        }

        .error-message p {
          margin: 0;
          color: #f0f0f0;
        }

        .retry-button {
          padding: 0.5rem 1rem;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #d32f2f;
        }

        @media (max-width: 768px) {
          .header-section {
            flex-direction: column;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}