'use client';
import GameHistory from '@/components/GameHistory';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HistoryPage() {
    return (
        <ProtectedRoute>
            <GameHistory />
        </ProtectedRoute>
    );
}