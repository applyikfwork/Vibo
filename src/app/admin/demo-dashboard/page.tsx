'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Settings, 
  Database,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react';

export default function DemoDataDashboard() {
  const [stats, setStats] = useState({
    totalPersonas: 0,
    activePersonas: 0,
    totalDemoVibes: 0,
    cacheHitRate: 0,
    blendingRatio: 70,
    realUsers: 0,
  });

  const [settings, setSettings] = useState({
    enableDemoData: true,
    autoBlending: true,
    timeBasedPatterns: true,
    ghostMode: true,
    cacheEnabled: true,
    cacheDuration: 60,
  });

  const [cityStats, setCityStats] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // In a real implementation, this would fetch from API
    const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];
    
    // Simulate city stats
    const mockCityStats = cities.map(city => ({
      city,
      personas: 10 + Math.floor(Math.random() * 20),
      activeToday: 3 + Math.floor(Math.random() * 10),
      demoVibes: 50 + Math.floor(Math.random() * 100),
      realVibes: Math.floor(Math.random() * 30),
      blendRatio: 50 + Math.floor(Math.random() * 30),
    }));

    setCityStats(mockCityStats);

    setStats({
      totalPersonas: mockCityStats.reduce((sum, c) => sum + c.personas, 0),
      activePersonas: mockCityStats.reduce((sum, c) => sum + c.activeToday, 0),
      totalDemoVibes: mockCityStats.reduce((sum, c) => sum + c.demoVibes, 0),
      cacheHitRate: 75 + Math.random() * 20,
      blendingRatio: 70,
      realUsers: mockCityStats.reduce((sum, c) => sum + c.realVibes, 0),
    });
  };

  const handleClearCache = () => {
    alert('Cache cleared! This would clear the demo data cache in production.');
  };

  const handleRefreshPersonas = () => {
    alert('Personas refreshed! This would regenerate all persona activity in production.');
  };

  const handleExportData = () => {
    alert('Exporting data... This would download persona and analytics data as JSON.');
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          Demo Data Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and control the sophisticated demo data system
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Personas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPersonas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePersonas} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Demo Vibes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDemoVibes}</div>
            <p className="text-xs text-muted-foreground">
              Generated across all cities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cacheHitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Performance optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blending Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blendingRatio}%</div>
            <p className="text-xs text-muted-foreground">
              Demo vs Real ({100 - stats.blendingRatio}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="cities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cities">
            <BarChart3 className="h-4 w-4 mr-2" />
            City Stats
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <PieChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* City Stats Tab */}
        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Per-City Breakdown</CardTitle>
              <CardDescription>
                Demo data distribution across Indian cities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cityStats.map((city) => (
                  <div key={city.city} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{city.city}</h3>
                      <Badge variant="secondary">{city.blendRatio}% demo</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Personas</div>
                        <div className="font-semibold">{city.personas}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Active</div>
                        <div className="font-semibold">{city.activeToday}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Demo Vibes</div>
                        <div className="font-semibold">{city.demoVibes}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Real Vibes</div>
                        <div className="font-semibold text-green-600">{city.realVibes}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demo System Settings</CardTitle>
              <CardDescription>
                Configure demo data behavior and blending
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="demo-enabled">Enable Demo Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Show demo data when real user count is low
                  </p>
                </div>
                <Switch
                  id="demo-enabled"
                  checked={settings.enableDemoData}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableDemoData: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-blending">Auto Blending</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust demo/real ratio
                  </p>
                </div>
                <Switch
                  id="auto-blending"
                  checked={settings.autoBlending}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoBlending: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="time-patterns">Time-Based Patterns</Label>
                  <p className="text-sm text-muted-foreground">
                    Peak hours, night reduction, weekend patterns
                  </p>
                </div>
                <Switch
                  id="time-patterns"
                  checked={settings.timeBasedPatterns}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, timeBasedPatterns: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ghost-mode">Ghost Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-reactions to real posts (5-30 mins)
                  </p>
                </div>
                <Switch
                  id="ghost-mode"
                  checked={settings.ghostMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, ghostMode: checked })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Cache Duration (minutes)</Label>
                <Slider
                  value={[settings.cacheDuration]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, cacheDuration: value })
                  }
                  max={180}
                  min={15}
                  step={15}
                />
                <p className="text-sm text-muted-foreground">
                  {settings.cacheDuration} minutes
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleClearCache} variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button onClick={handleRefreshPersonas} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Personas
                </Button>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                Real-time metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      System Status: Healthy
                    </h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All demo data services running smoothly. Cache performance optimal.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Avg Response Time</div>
                    <div className="text-2xl font-bold">42ms</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Requests/Hour</div>
                    <div className="text-2xl font-bold">1,247</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                    System Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Demo data blending is working optimally</li>
                    <li>• Consider increasing cache duration during peak hours</li>
                    <li>• Ghost mode is providing good engagement coverage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
