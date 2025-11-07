'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookOpen, Brain, Users, Heart, Calendar, Bell, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStudentHub } from '@/hooks/useStudentHub';
import { useStudyBreakNotifications } from '@/hooks/useStudyBreakNotifications';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function StudentHubPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const {
    profile,
    loading,
    toggleExamStressMode,
    toggleStudyBreakReminders,
    joinPeerCircle,
    linkParent,
    updateMoodTrend,
  } = useStudentHub();
  const { recordBreak } = useStudyBreakNotifications();

  const [parentEmail, setParentEmail] = useState('');
  const [isLinkingParent, setIsLinkingParent] = useState(false);
  const [isJoiningCircle, setIsJoiningCircle] = useState(false);

  useEffect(() => {
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleShareExamStress = () => {
    router.push('/?emotion=Exam Stress');
  };

  const handleJoinCircle = async () => {
    setIsJoiningCircle(true);
    try {
      const circleId = await joinPeerCircle('exam-stress');
      if (circleId) {
        toast({
          title: '👥 Joined Student Circle!',
          description: 'You are now connected with peers facing similar challenges.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not join circle. Please try again.',
      });
    } finally {
      setIsJoiningCircle(false);
    }
  };

  const handleLinkParent = async () => {
    if (!parentEmail || !parentEmail.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid parent email address.',
      });
      return;
    }

    setIsLinkingParent(true);
    try {
      await linkParent(parentEmail);
      await updateMoodTrend();
      toast({
        title: '✅ Parent Account Linked!',
        description: `Your parent (${parentEmail}) can now see your general mood trends.`,
      });
      setParentEmail('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not link parent account. Please try again.',
      });
    } finally {
      setIsLinkingParent(false);
    }
  };

  const handleTakeBreak = async () => {
    await recordBreak(10);
    toast({
      title: '🧘‍♂️ Break Recorded!',
      description: 'Great job taking a study break. You deserve it!',
    });
  };

  if (isUserLoading || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
          📚 Student Mental Health Hub
        </h1>
        <p className="text-gray-600 text-lg">
          Your safe space for exam stress, peer support, and emotional wellness
        </p>
        {profile && (
          <div className="mt-4 inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-purple-900">
              Current Mood Trend:
            </span>
            <span className={`text-sm font-bold ${
              profile.currentMoodTrend === 'improving' ? 'text-green-600' :
              profile.currentMoodTrend === 'struggling' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {profile.currentMoodTrend === 'improving' ? '📈 Improving' :
               profile.currentMoodTrend === 'struggling' ? '📉 Struggling' :
               '➡️ Stable'}
            </span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Exam Stress Mode */}
        <Card className="border-2 border-red-200 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-6 w-6 text-red-500" />
              <CardTitle className="text-red-700">Exam Stress Mode</CardTitle>
            </div>
            <CardDescription>
              Special support for exam preparation and academic pressure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="exam-stress-mode">Enable Exam Mode</Label>
              <Switch
                id="exam-stress-mode"
                checked={profile?.examStressModeEnabled || false}
                onCheckedChange={toggleExamStressMode}
              />
            </div>
            <Button
              onClick={handleShareExamStress}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              📝 Share Exam Stress
            </Button>
            <p className="text-xs text-gray-500">
              Get supportive vibes, study break reminders, and connect with students facing similar pressure
            </p>
            {profile?.examStressModeEnabled && (
              <div className="bg-red-50 p-3 rounded-lg text-xs text-red-700">
                ✅ Exam Stress Mode is active. You'll receive special support!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Break Reminders */}
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-blue-700">Study Break Reminders</CardTitle>
            </div>
            <CardDescription>
              Auto-detect stress and remind you to take healthy breaks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="study-reminders">Enable Reminders</Label>
              <Switch
                id="study-reminders"
                checked={profile?.studyBreakRemindersEnabled || false}
                onCheckedChange={toggleStudyBreakReminders}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-900 mb-1">Smart Detection</p>
              <p className="text-blue-700">
                When you post "Exam Stress" vibes for 2+ hours, we'll remind you to take a 10-minute break
              </p>
            </div>
            {profile?.studyBreakRemindersEnabled && (
              <Button
                onClick={handleTakeBreak}
                variant="outline"
                className="w-full border-blue-300 hover:bg-blue-50"
              >
                🧘‍♂️ Take a Break Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Anonymous Peer Support */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-purple-700">Peer Support</CardTitle>
            </div>
            <CardDescription>
              Connect with fellow students anonymously
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleJoinCircle}
              disabled={isJoiningCircle}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {isJoiningCircle ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
              ) : (
                <>👥 Join Student Circle</>
              )}
            </Button>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Share exam anxiety</p>
              <p>• Get motivation from peers</p>
              <p>• Anonymous support 24/7</p>
            </div>
          </CardContent>
        </Card>

        {/* Parent-Student Bridge */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-6 w-6 text-green-500" />
              <CardTitle className="text-green-700">Parent-Student Emotional Bridge</CardTitle>
            </div>
            <CardDescription>
              Let your parents see your general mood without reading your private posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">How it works:</h4>
              <ul className="text-sm text-green-800 space-y-2">
                <li>✅ Parents see: Overall mood (Happy/Stressed/Sad/Motivated)</li>
                <li>✅ Parents see: Trend over time (improving/struggling)</li>
                <li>❌ Parents DON'T see: Your actual posts or specific details</li>
                <li>💬 You stay anonymous with full privacy</li>
              </ul>
            </div>
            {profile?.linkedParentEmail ? (
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  ✅ Linked to: {profile.linkedParentEmail}
                </p>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-500 hover:bg-green-600">
                    Link Parent Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link Parent Account</DialogTitle>
                    <DialogDescription>
                      Enter your parent's email address to share your general mood trends
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      type="email"
                      placeholder="parent@example.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                    />
                    <Button
                      onClick={handleLinkParent}
                      disabled={isLinkingParent}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      {isLinkingParent ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Linking...</>
                      ) : (
                        'Link Account'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Exam Calendar */}
        <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-6 w-6 text-yellow-600" />
              <CardTitle className="text-yellow-700">Exam Calendar</CardTitle>
            </div>
            <CardDescription>
              Track upcoming exams and get emotional support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
              📅 Add Exam Schedule
            </Button>
            <div className="text-xs text-gray-500">
              Get tailored support vibes as your exam dates approach. Connect with students taking the same exams.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Tips Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            💡 Student Wellness Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-purple-900 mb-2">Before Exams</h4>
              <p className="text-sm text-gray-700">
                Share your "Exam Stress" vibes to get support. Take 10-minute breaks every 2 hours.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-pink-900 mb-2">During Exams</h4>
              <p className="text-sm text-gray-700">
                Use voice vibes to quickly express how you're feeling. Stay connected with your peer circle.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-blue-900 mb-2">After Exams</h4>
              <p className="text-sm text-gray-700">
                Celebrate with "Happy" vibes! Share your relief and support others still preparing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-purple-600">40M+</p>
          <p className="text-sm text-gray-600">Students in India</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-pink-600">5x</p>
          <p className="text-sm text-gray-600">More Engagement</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-blue-600">24/7</p>
          <p className="text-sm text-gray-600">Peer Support</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-green-600">100%</p>
          <p className="text-sm text-gray-600">Anonymous & Safe</p>
        </div>
      </div>
    </div>
  );
}
