'use client';

import { StoreItem } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface StoreItemCardProps {
  item: StoreItem;
  userCoins: number;
  onPurchase: (itemId: string) => void;
  isPurchasing?: boolean;
}

export function StoreItemCard({ item, userCoins, onPurchase, isPurchasing }: StoreItemCardProps) {
  const canAfford = userCoins >= item.price;

  const typeColors = {
    boost: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    badge: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    theme: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    filter: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    skip_token: 'from-red-500/20 to-pink-500/20 border-red-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${typeColors[item.type]} rounded-xl p-5 border relative overflow-hidden`}>
      {item.isLimitedTime && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
          LIMITED
        </div>
      )}

      <div className="text-center mb-4">
        <div className="text-5xl mb-3">{item.icon}</div>
        <h3 className="font-bold text-lg text-white">{item.name}</h3>
        <p className="text-sm text-gray-300 mt-2">{item.description}</p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1">
          <span className="text-2xl">🪙</span>
          <span className={`text-xl font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
            {item.price}
          </span>
        </div>

        <Button
          onClick={() => onPurchase(item.id)}
          disabled={!canAfford || isPurchasing}
          className={`${
            canAfford
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isPurchasing ? 'Purchasing...' : canAfford ? 'Buy Now' : 'Not Enough Coins'}
        </Button>
      </div>

      {item.effectDuration && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Effect lasts: {Math.floor(item.effectDuration / 3600)}h
        </p>
      )}
    </div>
  );
}
