import { MoodChart } from '@/components/MoodChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoryPage() {
    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Your Mood History</h1>
                <p className="text-muted-foreground mt-2">A look back at your week in vibes.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Emotion Flow</CardTitle>
                    <CardDescription>This chart shows the vibes you've posted over the last 7 days, helping you reflect on your emotional patterns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <MoodChart />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
