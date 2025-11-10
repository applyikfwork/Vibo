'use client';

import { getKarmaTier, getKarmaImpact } from '@/lib/rewards/karma-system';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KarmaDisplayProps {
  karma: number;
  compact?: boolean;
}

export function KarmaDisplay({ karma, compact = false }: KarmaDisplayProps) {
  const tier = getKarmaTier(karma);
  const impact = getKarmaImpact(karma);
  const nextTier = tier.maxKarma !== Infinity ? tier.maxKarma + 1 : null;
  
  const progress = nextTier 
    ? ((karma - tier.minKarma) / (tier.maxKarma - tier.minKarma)) * 100
    : 100;

  const tierColors = {
    'Limited': 'from-red-400 to-red-600',
    'New User': 'from-gray-400 to-gray-600',
    'Trusted': 'from-blue-400 to-blue-600',
    'Respected': 'from-purple-400 to-purple-600',
    'Community Leader': 'from-yellow-400 to-yellow-600',
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${tierColors[tier.name as keyof typeof tierColors]} text-white text-sm font-semibold cursor-pointer`}>
              <span>⚡</span>
              <span>{karma}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-bold">{tier.name}</div>
              <div className="text-xs text-gray-400">{tier.description}</div>
              <div className="text-sm mt-1">Feed Boost: {tier.feedBoost}x</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Karma Score</div>
            <div className="text-3xl font-bold">{karma}</div>
          </div>
          <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${tierColors[tier.name as keyof typeof tierColors]} text-white font-bold`}>
            {tier.name}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">{tier.description}</div>
          {nextTier && (
            <>
              <Progress value={progress} className="h-3 mb-1" />
              <div className="text-xs text-gray-500">
                {tier.maxKarma - karma} karma to next tier
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-gray-500">Feed Visibility</div>
            <div className="font-semibold capitalize">{tier.visibility}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Recommendation Boost</div>
            <div className="font-semibold">{tier.feedBoost}x</div>
          </div>
        </div>

        {impact.restrictions.length > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm font-semibold text-red-600 mb-2">Restrictions:</div>
            <ul className="text-xs text-red-500 space-y-1">
              {impact.restrictions.map((restriction, i) => (
                <li key={i}>• {restriction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
