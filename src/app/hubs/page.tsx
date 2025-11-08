'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import { CommunityHub, HubRecommendation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { Users, TrendingUp, Activity, ArrowRight, Sparkles, Target, Heart, Plus, Calendar, Trophy, Flame, Swords, Crown, Zap } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CommunityHubsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [hubs, setHubs] = useState<CommunityHub[]>([]);
  const [joinedHubs, setJoinedHubs] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<HubRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newHubData, setNewHubData] = useState({ name: '', description: '', icon: '🎯' });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [activeBattles, setActiveBattles] = useState<any[]>([]);

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

  const fetchRecommendations = async () => {
    if (!user) return;
    
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/hubs/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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

  const handleCreateHub = async () => {
    if (!newHubData.name || !newHubData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and description for your hub',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/hubs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newHubData.name,
          description: newHubData.description,
          icon: newHubData.icon,
          creatorId: user?.uid
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Hub Created! 🎉',
          description: `${newHubData.name} has been created successfully!`,
        });
        setShowCreateDialog(false);
        setNewHubData({ name: '', description: '', icon: '🎯' });
        await fetchHubs();
      } else {
        const error = await response.json();
        toast({
          title: 'Creation Failed',
          description: error.message || 'Failed to create hub. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating hub:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the hub',
        variant: 'destructive'
      });
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/gamification/hubs/events');
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.events || []);
      } else {
        setUpcomingEvents([
          { id: 1, name: 'Motivation Monday', date: 'Dec 9, 2024', hub: 'Motivation Station', participants: 42 },
          { id: 2, name: 'Weekend Chill Fest', date: 'Dec 14, 2024', hub: 'Chill Corner', participants: 128 }
        ]);
      }
    } catch (error) {
      console.log('[Hubs] Using demo events data');
      setUpcomingEvents([
        { id: 1, name: 'Motivation Monday', date: 'Dec 9, 2024', hub: 'Motivation Station', participants: 42 },
        { id: 2, name: 'Weekend Chill Fest', date: 'Dec 14, 2024', hub: 'Chill Corner', participants: 128 }
      ]);
    }
  };

  const fetchBattles = async () => {
    try {
      const response = await fetch('/api/gamification/hubs/battles');
      if (response.ok) {
        const data = await response.json();
        setActiveBattles(data.battles || []);
      } else {
        setActiveBattles([
          { id: 1, name: 'Happy vs Chill', hubs: ['Happy Vibes Only', 'Chill Corner'], score: [1250, 1180], endDate: '3 days' },
          { id: 2, name: 'Motivation Showdown', hubs: ['Motivation Station', 'Study Support'], score: [890, 920], endDate: '5 days' }
        ]);
      }
    } catch (error) {
      console.log('[Hubs] Using demo battles data');
      setActiveBattles([
        { id: 1, name: 'Happy vs Chill', hubs: ['Happy Vibes Only', 'Chill Corner'], score: [1250, 1180], endDate: '3 days' },
        { id: 2, name: 'Motivation Showdown', hubs: ['Motivation Station', 'Study Support'], score: [890, 920], endDate: '5 days' }
      ]);
    }
  };

  useEffect(() => {
    console.log('[Hubs] useEffect triggered, user:', user?.uid || 'not logged in');
    const loadData = async () => {
      console.log('[Hubs] Starting to load data');
      setLoading(true);
      try {
        console.log('[Hubs] Fetching hubs data...');
        await Promise.all([
          fetchHubs(), 
          fetchUserHubs(), 
          fetchRecommendations(),
          fetchEvents(),
          fetchBattles()
        ]);
        console.log('[Hubs] Successfully loaded hubs data');
      } catch (error) {
        console.error('[Hubs] Error loading hubs data:', error);
      } finally {
        console.log('[Hubs] Setting loading to false');
        setLoading(false);
      }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              Community Hubs Powerhouse
            </h1>
            <p className="text-gray-400">Join communities, compete in battles, and attend events</p>
          </div>
          {user && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Hub
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Your Own Hub</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Build a community around your passion
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Hub Name</label>
                    <Input
                      value={newHubData.name}
                      onChange={(e) => setNewHubData({ ...newHubData, name: e.target.value })}
                      placeholder="My Awesome Hub"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <Textarea
                      value={newHubData.description}
                      onChange={(e) => setNewHubData({ ...newHubData, description: e.target.value })}
                      placeholder="Describe what your hub is about..."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Icon (Emoji)</label>
                    <Input
                      value={newHubData.icon}
                      onChange={(e) => setNewHubData({ ...newHubData, icon: e.target.value })}
                      placeholder="🎯"
                      className="bg-gray-800 border-gray-700 text-white"
                      maxLength={2}
                    />
                  </div>
                  <Button onClick={handleCreateHub} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    Create Hub
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-6 w-6" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-white">{event.name}</div>
                        <div className="text-sm text-gray-400">{event.hub}</div>
                      </div>
                      <Badge variant="outline" className="text-orange-400 border-orange-400">
                        {event.date}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{event.participants} participants</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Swords className="h-6 w-6" />
                Active Hub Battles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeBattles.map(battle => (
                  <div key={battle.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-bold text-white">{battle.name}</div>
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        Ends in {battle.endDate}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{battle.hubs[0]}</span>
                        <span className="text-white font-bold">{battle.score[0]}</span>
                      </div>
                      <Progress value={(battle.score[0] / (battle.score[0] + battle.score[1])) * 100} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{battle.hubs[1]}</span>
                        <span className="text-white font-bold">{battle.score[1]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {user && recommendations.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => {
                const hub = rec.hub;
                const isJoined = joinedHubs.includes(hub.id);
                const activityLevel = rec.activityLevel;
                
                return (
                  <Card
                    key={hub.id}
                    className="group relative bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/40 rounded-2xl p-6 border-2 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-pink-500/30 border border-pink-500/60 rounded-full px-2 py-1 text-xs text-pink-300">
                      <Heart className="h-3 w-3 fill-current" />
                      <span>{Math.round(rec.matchScore)}% match</span>
                    </div>
                    
                    <Link href={`/hubs/${hub.id}`} className="block">
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                          {hub.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                          {hub.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">{hub.description}</p>
                        
                        <div className="bg-black/30 rounded-lg p-2 mb-3">
                          <p className="text-xs text-pink-300 font-semibold mb-1">Why we recommend this:</p>
                          {rec.reasons.slice(0, 2).map((reason, idx) => (
                            <p key={idx} className="text-xs text-gray-400">• {reason}</p>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{hub.memberCount}</span>
                          </div>
                          {activityLevel === 'high' && (
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="h-3 w-3" />
                              <span>Very Active</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleJoinLeave(hub.id, isJoined)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        Join Hub +25 XP
                      </Button>
                      <Link href={`/hubs/${hub.id}`} className="shrink-0">
                        <Button variant="outline" className="border-pink-600 hover:bg-pink-900/30">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            {user && joinedHubs.length > 0 ? 'All Hubs' : 'Discover Hubs'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub) => {
            const isJoined = joinedHubs.includes(hub.id);
            const activityLevel = (hub.recentActivityCount || 0) > 20 ? 'high' : 
                                 (hub.recentActivityCount || 0) > 10 ? 'medium' : 'low';
            
            return (
              <Card
                key={hub.id}
                className={`group relative bg-gradient-to-br ${
                  isJoined
                    ? 'from-purple-500/30 to-pink-500/30 border-purple-500/50'
                    : 'from-gray-800/50 to-gray-900/50 border-gray-700/30'
                } rounded-2xl p-6 border-2 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden`}
              >
                {activityLevel === 'high' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/20 border border-green-500/50 rounded-full px-2 py-1 text-xs text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active</span>
                  </div>
                )}
                
                <Link href={`/hubs/${hub.id}`} className="block">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                      {hub.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                      {hub.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">{hub.description}</p>
                    
                    <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{hub.memberCount}</span>
                      </div>
                      {hub.recentActivityCount && hub.recentActivityCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{hub.recentActivityCount} today</span>
                        </div>
                      )}
                    </div>
                    
                    {isJoined && (
                      <div className="flex items-center justify-center gap-1 text-purple-400 text-sm mb-3 font-semibold">
                        <Sparkles className="h-4 w-4" />
                        <span>You're a member</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleJoinLeave(hub.id, isJoined)}
                    className={`flex-1 ${
                      isJoined
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    {isJoined ? 'Leave Hub' : 'Join Hub +25 XP'}
                  </Button>
                  <Link href={`/hubs/${hub.id}`} className="shrink-0">
                    <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}