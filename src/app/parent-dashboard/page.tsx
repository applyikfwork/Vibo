'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { StudentHubService } from '@/lib/student-hub-services';
import { useToast } from '@/hooks/use-toast';

export default function ParentDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<StudentHubService | null>(null);

  useEffect(() => {
    if (firestore) {
      setService(new StudentHubService(firestore));
    }
  }, [firestore]);

  useEffect(() => {
    if (user && !user.isAnonymous && user.email) {
      setEmail(user.email);
      loadDashboard(user.email);
    }
  }, [user]);

  const loadDashboard = async (parentEmail: string) => {
    if (!service) return;

    setLoading(true);
    try {
      const data = await service.getParentDashboardData(parentEmail);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load dashboard data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDashboard = () => {
    if (!email || !email.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }
    loadDashboard(email);
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Happy':
        return 'text-green-600 bg-green-50';
      case 'Stressed':
        return 'text-red-600 bg-red-50';
      case 'Sad':
        return 'text-blue-600 bg-blue-50';
      case 'Neutral':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-purple-600 bg-purple-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'struggling':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-blue-600" />;
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="h-8 w-8 text-green-600" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Parent Dashboard
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Stay connected with your child's emotional wellness
        </p>
      </header>

      {/* Email Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Access Student Mood Trends</CardTitle>
          <CardDescription>
            Enter your email to view connected students' general mood trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent-email">Your Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="parent-email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleLoadDashboard}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                ) : (
                  'View Dashboard'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🔒</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Privacy Protected</h3>
              <p className="text-sm text-blue-800">
                You can only see general mood trends and overall emotional state. 
                Individual posts, specific details, and private conversations remain completely private.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Data */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : dashboardData.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Students Linked
            </h3>
            <p className="text-gray-500">
              Ask your child to link your email from their Student Hub to see their mood trends here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardData.map((student, index) => (
            <Card key={index} className="border-2 border-purple-200 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Student #{index + 1}</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(student.trend)}
                    <span className="text-sm font-normal capitalize">{student.trend}</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  Current emotional wellness overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Mood */}
                <div>
                  <Label className="text-sm text-gray-600">Overall Mood</Label>
                  <div className={`mt-1 px-4 py-3 rounded-lg font-semibold text-center ${getMoodColor(student.overallMood)}`}>
                    {student.overallMood}
                  </div>
                </div>

                {/* Weekly Mood Breakdown */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">This Week's Emotions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">😊 Happy</span>
                      <span className="font-semibold text-green-600">{student.weeklyMoodSummary.happy || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">📚 Stressed</span>
                      <span className="font-semibold text-red-600">{student.weeklyMoodSummary.stressed || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">😢 Sad</span>
                      <span className="font-semibold text-blue-600">{student.weeklyMoodSummary.sad || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">💪 Motivated</span>
                      <span className="font-semibold text-purple-600">{student.weeklyMoodSummary.motivated || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Supportive Messages Based on Trend */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {student.trend === 'improving' && (
                    <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      ✅ Great news! Your child's emotional state is improving. Keep being supportive!
                    </p>
                  )}
                  {student.trend === 'struggling' && (
                    <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                      💛 Your child might need extra support. Consider reaching out for a conversation.
                    </p>
                  )}
                  {student.trend === 'stable' && (
                    <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                      💙 Your child's mood is stable. Continue being present and supportive.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Helpful Tips */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 Tips for Supporting Your Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-green-900 mb-2">Listen Actively</h4>
              <p className="text-sm text-gray-700">
                Create a safe space for open conversation without judgment.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-blue-900 mb-2">Respect Privacy</h4>
              <p className="text-sm text-gray-700">
                Avoid pushing for details. They'll share when ready.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-purple-900 mb-2">Show Support</h4>
              <p className="text-sm text-gray-700">
                Acknowledge their feelings and offer encouragement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
