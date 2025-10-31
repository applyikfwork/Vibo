'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Vibe, Emotion } from '@/lib/types';

interface EmotionTabsProps {
    emotions: Emotion[];
    initialVibes: Vibe[];
    renderContent: (filteredVibes: Vibe[]) => React.ReactNode;
}

const mainEmotions: string[] = ['Happy', 'Sad', 'Chill', 'Motivated', 'Lonely'];

export function EmotionTabs({ emotions, initialVibes, renderContent }: EmotionTabsProps) {
    const [activeTab, setActiveTab] = useState('All');
    
    const filteredVibes = activeTab === 'All' 
        ? initialVibes 
        : initialVibes.filter(vibe => vibe.emotion === activeTab);
        
    const displayEmotions = emotions.filter(e => mainEmotions.includes(e.name));

    return (
        <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
                <TabsList className="h-auto p-1.5 flex flex-wrap justify-center">
                    <TabsTrigger value="All" className="px-4 py-2">All Vibes</TabsTrigger>
                    {displayEmotions.map(emotion => (
                        <TabsTrigger key={emotion.name} value={emotion.name} className="px-4 py-2 flex items-center gap-2">
                            <span>{emotion.emoji}</span>
                            <span className="hidden sm:inline">{emotion.name}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            <TabsContent value={activeTab}>
                {renderContent(filteredVibes)}
            </TabsContent>
        </Tabs>
    );
}