'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { 
  Users, TrendingUp, Trophy, Activity, ArrowLeft, CheckCircle,
  Target, Gift, BarChart3, Calendar, Clock, Flame
} from 'lucide-react';
import Link from 'next/link';
import { VibeCard } from '@/components/VibeCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Vibe {
  id: string;
  emotion: string;
  text: string;
  author: { name: string; avatarUrl: string };
  timestamp: string;
  reactionCount: number;
  commentCount: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  target: number;
  progress?: number;
  reward: { xp: number; coins: number };
  icon: string;
  difficulty: string;
  completed?: boolean;
}

interface Contributor {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string;
  xp: number;
  level: number;
}

export default function HubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const hubId = params.hubId as string;

  const [activeTab, setActiveTab] = useState('feed');
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  const hubInfo: { [key: string]: any } = {
    'motivation-hub': {
      name: 'Motivation Station',
      description: 'Share your drive and inspire others to achieve their goals',
      icon: '💪',
      theme: 'Motivated',
      color: 'from-orange-500 to-red-500'
    },
    'alone-zone': {
      name: 'Alone Zone',
      description: 'A safe space for when you need solitude and understanding',
      icon: '🌙',
      theme: 'Lonely',
      color: 'from-indigo-500 to-purple-500'
    },
    'happy-vibes': {
      name: 'Happy Vibes Only',
      description: 'Spread joy and celebrate the good moments',
      icon: '😊',
      theme: 'Happy',
      color: 'from-yellow-400 to-pink-400'
    },
    'study-support': {
      name: 'Study Support',
      description: 'Students helping students through exam stress',
      icon: '📚',
      theme: 'Exam Stress',
      color: 'from-blue-500 to-cyan-500'
    },
    'chill-corner': {
      name: 'Chill Corner',
      description: 'Relax, unwind, and share peaceful moments',
      icon: '🧘',
      theme: 'Chill',
      color: 'from-green-400 to-teal-400'
    }
  };

  const currentHub = hubInfo[hubId] || null;

  useEffect(() => {
    if (currentHub) {
      loadHubData();
      checkMembership();
    }
  }, [hubId, user]);

  const checkMembership = async () => {
    if (!user) return;
    
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/rewards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsJoined(data.joinedHubs?.includes(hubId) || false);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const loadHubData = async () => {
    setLoading(true);
    try {
      const token = user ? await getAuth().currentUser?.getIdToken() : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [feedRes, statsRes, challengesRes, analyticsRes] = await Promise.all([
        fetch(`/api/gamification/hubs/${hubId}/feed?limit=20`),
        fetch(`/api/gamification/hubs/${hubId}/stats`),
        fetch(`/api/gamification/hubs/${hubId}/challenges`, { headers }),
        fetch(`/api/gamification/hubs/${hubId}/analytics`)
      ]);

      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setVibes(feedData.vibes || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setContributors(statsData.topContributors || []);
      }

      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        setChallenges(challengesData.challenges || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading hub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
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
          description: isJoined 
            ? 'You left the community' 
            : `Welcome to ${currentHub.name}! +25 XP`
        });
        setIsJoined(!isJoined);
        await loadHubData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update hub membership',
        variant: 'destructive'
      });
    }
  };

  if (!currentHub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Hub not found</h1>
          <Button onClick={() => router.push('/hubs')}>Back to Hubs</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin text-6xl">{currentHub.icon}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/hubs')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Hubs
        </Button>

        <div className={`bg-gradient-to-r ${currentHub.color} rounded-3xl p-8 mb-8 shadow-2xl`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-8xl">{currentHub.icon}</div>
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">{currentHub.name}</h1>
                <p className="text-white/90 text-lg mb-4">{currentHub.description}</p>
                <div className="flex gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">{stats?.activeMembers || 0} Active Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-semibold">{stats?.weeklyPostCount || 0} Posts This Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold capitalize">{stats?.moodTrend || 'Stable'} Trend</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={handleJoinLeave}
              size="lg"
              className={`${
                isJoined
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-white hover:bg-white/90 text-gray-900'
              } font-bold`}
            >
              {isJoined ? 'Leave Hub' : 'Join Hub +25 XP'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800/50 p-1 rounded-xl grid w-full grid-cols-5">
            <TabsTrigger value="feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <Activity className="h-4 w-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <Target className="h-4 w-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <Users className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Community Feed</h2>
              <Link href={`/?emotion=${currentHub.theme}`}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Post to {currentHub.name}
                </Button>
              </Link>
            </div>
            {vibes.length === 0 ? (
              <Card className="p-12 text-center bg-gray-800/30 border-gray-700">
                <div className="text-6xl mb-4">{currentHub.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share a vibe in this hub!</p>
                <Link href={`/?emotion=${currentHub.theme}`}>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Create First Post
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {vibes.map((vibe) => (
                  <VibeCard key={vibe.id} vibe={vibe as any} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Hub Challenges</h2>
              <p className="text-gray-400">Complete challenges to earn XP and coins!</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challenge) => {
                const progressPercent = ((challenge.progress || 0) / challenge.target) * 100;
                const difficultyColors = {
                  easy: 'from-green-500/20 to-green-600/20 border-green-500/30',
                  medium: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
                  hard: 'from-red-500/20 to-pink-500/20 border-red-500/30'
                };

                return (
                  <Card
                    key={challenge.id}
                    className={`bg-gradient-to-br ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]} border-2 p-6 relative overflow-hidden`}
                  >
                    {challenge.completed && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                    )}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl">{challenge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white">{challenge.name}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-800/50 text-gray-300 capitalize">
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-purple-400">
                            <Calendar className="h-4 w-4" />
                            <span className="font-semibold capitalize">{challenge.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Gift className="h-4 w-4" />
                            <span className="font-semibold">+{challenge.reward.xp} XP, +{challenge.reward.coins} coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-semibold">
                          {challenge.progress || 0} / {challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Top Contributors</h2>
              <p className="text-gray-400">The most active members in this hub</p>
            </div>
            <Card className="bg-gray-800/30 border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {contributors.map((contributor) => (
                      <tr key={contributor.userId} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                            contributor.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900' :
                            contributor.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                            contributor.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-gray-900' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {contributor.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {contributor.name[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-white font-medium">{contributor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 font-semibold">
                            Level {contributor.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-yellow-400 font-bold">{contributor.xp.toLocaleString()} XP</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Hub Analytics</h2>
              <p className="text-gray-400">30-day activity and engagement trends</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-8 w-8 text-purple-400" />
                  <span className="text-2xl">📝</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics?.stats?.totalPosts || 0}
                </div>
                <div className="text-sm text-gray-300">Total Posts</div>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-8 w-8 text-pink-400" />
                  <span className="text-2xl">❤️</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics?.stats?.totalReactions || 0}
                </div>
                <div className="text-sm text-gray-300">Total Reactions</div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                  <span className="text-2xl">📊</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics?.stats?.avgPostsPerDay || 0}
                </div>
                <div className="text-sm text-gray-300">Avg Posts/Day</div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-green-400" />
                  <span className="text-2xl">⏰</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analytics?.stats?.peakActivityHour || 12}:00
                </div>
                <div className="text-sm text-gray-300">Peak Activity</div>
              </Card>
            </div>

            <Card className="bg-gray-800/30 border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white mb-6">30-Day Activity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="posts"
                    stroke="#A855F7"
                    strokeWidth={3}
                    dot={{ fill: '#A855F7', r: 4 }}
                    name="Posts"
                  />
                  <Line
                    type="monotone"
                    dataKey="reactions"
                    stroke="#EC4899"
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', r: 4 }}
                    name="Reactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700 p-8">
              <div className="text-center mb-8">
                <div className="text-8xl mb-4">{currentHub.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-3">{currentHub.name}</h2>
                <p className="text-gray-300 text-lg">{currentHub.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Hub Guidelines</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Be respectful and supportive of all members</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Share authentic emotions and experiences</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Offer help and encouragement when you can</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Keep posts relevant to the hub's theme</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">What You'll Find Here</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-gray-300">
                      <span className="text-2xl flex-shrink-0">🎯</span>
                      <span>Themed challenges and missions</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <span className="text-2xl flex-shrink-0">👥</span>
                      <span>A supportive community of like-minded people</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <span className="text-2xl flex-shrink-0">🏆</span>
                      <span>Leaderboards and recognition</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <span className="text-2xl flex-shrink-0">📊</span>
                      <span>Insights into community mood trends</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-3">Join Benefits</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-white font-semibold">+25 XP</div>
                    <div className="text-gray-300 text-sm">For joining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎁</div>
                    <div className="text-white font-semibold">Exclusive Challenges</div>
                    <div className="text-gray-300 text-sm">Hub-specific missions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🏅</div>
                    <div className="text-white font-semibold">Special Badges</div>
                    <div className="text-gray-300 text-sm">Unlock achievements</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
