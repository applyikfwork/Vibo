'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartConfig
} from '@/components/ui/chart';
import { moodHistory } from '@/lib/data';

const chartConfig = {
    Happy: { label: 'Happy', color: 'hsl(var(--chart-1))' },
    Sad: { label: 'Sad', color: 'hsl(var(--chart-2))' },
    Chill: { label: 'Chill', color: 'hsl(var(--chart-3))' },
    Motivated: { label: 'Motivated', color: 'hsl(var(--chart-4))' },
    Lonely: { label: 'Lonely', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;

export function MoodChart() {
    return (
        <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart accessibilityLayer data={moodHistory} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="Happy" stackId="a" fill="var(--color-Happy)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sad" stackId="a" fill="var(--color-Sad)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chill" stackId="a" fill="var(--color-Chill)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Motivated" stackId="a" fill="var(--color-Motivated)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lonely" stackId="a" fill="var(--color-Lonely)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
    );
}
