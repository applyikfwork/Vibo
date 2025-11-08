'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { RewardTransaction } from '@/lib/types';
import { format } from 'date-fns';

interface RewardHistoryProps {
  className?: string;
}

export function RewardHistory({ className = '' }: RewardHistoryProps) {
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) return;

      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'all') {
        params.append('type', filter);
      }

      const response = await fetch(`/api/gamification/transactions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('POST')) return '✍️';
    if (action.includes('REACT')) return '❤️';
    if (action.includes('COMMENT')) return '💬';
    if (action.includes('MISSION') || action.includes('CHALLENGE')) return '🎯';
    if (action.includes('PURCHASE')) return '🛒';
    if (action.includes('LEVEL')) return '⬆️';
    return '⭐';
  };

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-2">⚡</div>
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Reward History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('earn')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'earn'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Earned
          </button>
          <button
            onClick={() => setFilter('spend')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'spend'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Spent
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No transactions yet. Start earning rewards!</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{getActionIcon(transaction.action)}</span>
                <div>
                  <p className="text-white font-medium">
                    {getActionLabel(transaction.action)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {transaction.timestamp && typeof transaction.timestamp === 'string'
                      ? format(new Date(transaction.timestamp), 'MMM d, yyyy h:mm a')
                      : 'Unknown date'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {transaction.xpChange !== undefined && transaction.xpChange !== 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⚡</span>
                    <span
                      className={`font-bold ${
                        transaction.xpChange > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {transaction.xpChange > 0 ? '+' : ''}
                      {transaction.xpChange}
                    </span>
                  </div>
                )}

                {transaction.coinsChange !== undefined && transaction.coinsChange !== 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">🪙</span>
                    <span
                      className={`font-bold ${
                        transaction.coinsChange > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {transaction.coinsChange > 0 ? '+' : ''}
                      {transaction.coinsChange}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
