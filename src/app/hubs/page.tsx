'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import { CommunityHub } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { Users } from 'lucide-react';

export default function CommunityHubsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [hubs, setHubs] = useState<CommunityHub[]>([]);
  const [joinedHubs, setJoinedHubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHubs = async () => {
    try {
      const response = await fetch('/api/gamification/hubs');
      if (response.ok) {
        const data = await response.json();
        setHubs(data.hubs || []);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
    }
  };

  const fetchUserHubs = async () => {
    if (!user) return;
    
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/rewards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJoinedHubs(data.joinedHubs || []);
      }
    } catch (error) {
      console.error('Error fetching user hubs:', error);
    }
  };

  const handleJoinLeave = async (hubId: string, isJoined: boolean) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join hubs',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/hubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hubId,
          action: isJoined ? 'leave' : 'join'
        })
      });

      if (response.ok) {
        toast({
          title: isJoined ? 'Left Hub' : 'Joined Hub! 🎉',
          description: isJoined ? 'You left the community' : 'Welcome to the community!'
        });
        await fetchUserHubs();
        await fetchHubs();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update hub membership',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHubs(), fetchUserHubs()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🌀</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-2">
            Community Hubs
          </h1>
          <p className="text-gray-400">Join communities that match your vibe</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub) => {
            const isJoined = joinedHubs.includes(hub.id);
            return (
              <div
                key={hub.id}
                className={`bg-gradient-to-br ${
                  isJoined
                    ? 'from-purple-500/30 to-pink-500/30 border-purple-500/50'
                    : 'from-gray-800/50 to-gray-900/50 border-gray-700/30'
                } rounded-2xl p-6 border-2 transition-all hover:scale-105`}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{hub.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{hub.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{hub.description}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                    <Users className="h-4 w-4" />
                    <span>{hub.memberCount} members</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleJoinLeave(hub.id, isJoined)}
                  className={`w-full ${
                    isJoined
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}
                >
                  {isJoined ? 'Leave Hub' : 'Join Hub +25 XP'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}