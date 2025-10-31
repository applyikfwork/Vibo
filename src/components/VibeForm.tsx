'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { getEmojiSuggestion, FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

function SuggestButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Suggest Emoji
    </Button>
  );
}

export function VibeForm() {
    const initialState: FormState = { message: '' };
    const [state, formAction] = useFormState(getEmojiSuggestion, initialState);
    const { toast } = useToast();
    const [emoji, setEmoji] = useState('✨');
    const [vibeText, setVibeText] = useState('');

    useEffect(() => {
        if (state.message && state.error) {
            toast({
                variant: 'destructive',
                title: 'Oops!',
                description: state.message,
            });
        }
        if (state.emoji) {
            setEmoji(state.emoji);
            toast({ title: 'New emoji suggested!', description: `We think ${state.emoji} fits your vibe.` });
        }
    }, [state, toast]);

    const handlePostVibe = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (vibeText.trim().length < 3) {
            toast({
                variant: 'destructive',
                title: 'Too short!',
                description: 'Your vibe needs to be at least 3 characters long.',
            });
            return;
        }
        
        toast({
            title: 'Vibe Posted!',
            description: `You shared: "${vibeText}" ${emoji}`,
        });

        setVibeText('');
        setEmoji('✨');
    };

    return (
        <Card className="shadow-xl shadow-primary/5 border-border/20">
            <form action={formAction}>
                <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl pt-2 transition-transform duration-200 hover:scale-110 cursor-pointer">{emoji}</div>
                        <Textarea
                            name="vibeText"
                            placeholder="Type your current feeling, thought, or mood..."
                            className="text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 shadow-none min-h-[80px] resize-none bg-transparent"
                            value={vibeText}
                            onChange={(e) => setVibeText(e.target.value)}
                            required
                            minLength={3}
                        />
                    </div>
                </CardContent>
                <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-t">
                    <div className="flex items-center space-x-2">
                        <Switch id="anonymous-mode" />
                        <Label htmlFor="anonymous-mode" className="text-sm text-muted-foreground">Post Anonymously</Label>
                    </div>
                    <div className="flex gap-2">
                        <SuggestButton />
                        <Button onClick={handlePostVibe}>
                            <Send className="mr-2 h-4 w-4" />
                            Post Vibe
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
