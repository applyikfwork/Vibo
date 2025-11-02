'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Vibe, Emotion } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EmotionTabsProps {
    emotions: Emotion[];
    initialVibes: Vibe[];
    renderContent: (filteredVibes: Vibe[]) => React.ReactNode;
}

const mainEmotions: string[] = ['Happy', 'Sad', 'Chill', 'Motivated', 'Lonely'];

const emotionColors: Record<string, { bg: string; activeBg: string; text: string; border: string; shadow: string }> = {
    'Happy': { 
        bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', 
        activeBg: 'bg-gradient-to-r from-yellow-400 to-orange-500', 
        text: 'text-yellow-700',
        border: 'border-yellow-400',
        shadow: 'shadow-lg shadow-yellow-500/30'
    },
    'Sad': { 
        bg: 'bg-gradient-to-r from-blue-100 to-cyan-100', 
        activeBg: 'bg-gradient-to-r from-blue-400 to-cyan-500', 
        text: 'text-blue-700',
        border: 'border-blue-400',
        shadow: 'shadow-lg shadow-blue-500/30'
    },
    'Chill': { 
        bg: 'bg-gradient-to-r from-teal-100 to-cyan-100', 
        activeBg: 'bg-gradient-to-r from-teal-400 to-cyan-500', 
        text: 'text-teal-700',
        border: 'border-teal-400',
        shadow: 'shadow-lg shadow-teal-500/30'
    },
    'Motivated': { 
        bg: 'bg-gradient-to-r from-pink-100 to-rose-100', 
        activeBg: 'bg-gradient-to-r from-pink-500 to-rose-600', 
        text: 'text-pink-700',
        border: 'border-pink-400',
        shadow: 'shadow-lg shadow-pink-500/30'
    },
    'Lonely': { 
        bg: 'bg-gradient-to-r from-purple-100 to-violet-100', 
        activeBg: 'bg-gradient-to-r from-purple-500 to-violet-600', 
        text: 'text-purple-700',
        border: 'border-purple-400',
        shadow: 'shadow-lg shadow-purple-500/30'
    },
};

export function EmotionTabs({ emotions, initialVibes, renderContent }: EmotionTabsProps) {
    const [activeTab, setActiveTab] = useState('All');
    
    const filteredVibes = activeTab === 'All' 
        ? initialVibes 
        : initialVibes.filter(vibe => vibe.emotion === activeTab);
        
    const displayEmotions = emotions.filter(e => mainEmotions.includes(e.name));

    return (
        <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-10">
                <TabsList className="h-auto p-2 flex flex-wrap justify-center gap-2 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border-2 border-white/40">
                    <TabsTrigger 
                        value="All" 
                        className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300",
                            "hover:scale-105",
                            activeTab === 'All' 
                                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-lg shadow-purple-500/40" 
                                : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:shadow-md"
                        )}
                    >
                        ✨ All Vibes
                    </TabsTrigger>
                    {displayEmotions.map(emotion => {
                        const colors = emotionColors[emotion.name];
                        const isActive = activeTab === emotion.name;
                        return (
                            <TabsTrigger 
                                key={emotion.name} 
                                value={emotion.name} 
                                className={cn(
                                    "px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300",
                                    "hover:scale-105 border-2",
                                    isActive 
                                        ? `${colors.activeBg} text-white ${colors.shadow} border-white/40` 
                                        : `${colors.bg} ${colors.text} hover:shadow-md ${colors.border}`
                                )}
                            >
                                <span className="text-lg">{emotion.emoji}</span>
                                <span className="hidden sm:inline">{emotion.name}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </div>
            <TabsContent value={activeTab}>
                {renderContent(filteredVibes)}
            </TabsContent>
        </Tabs>
    );
}