'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateProfileSettings } from '@/app/profile/actions';
import { Skeleton } from '@/components/ui/skeleton';

function SettingsLoading() {
    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <div className="space-y-2 mb-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
}

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState('');
    const [isAnonymousDefault, setIsAnonymousDefault] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && (!user || user.isAnonymous)) {
            router.push('/login');
        }
        if (user) {
            setDisplayName(user.displayName || '');
            // Here you would fetch the default anonymous status from your user profile in Firestore
            // For now, we'll default it to false.
        }
    }, [user, isUserLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        const result = await updateProfileSettings({
            userId: user.uid,
            displayName,
            // isAnonymousDefault is not implemented in the action yet
        });

        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: result.message,
            });
        } else {
            toast({
                title: 'Settings Updated',
                description: 'Your profile has been successfully updated.',
            });
        }

        setIsSubmitting(false);
    };

    if (isUserLoading || !user || user.isAnonymous) {
        return <SettingsLoading />;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account and application settings.</p>
            </header>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>This information will be displayed on your profile and posts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user.email || ''} disabled />
                            <p className="text-sm text-muted-foreground">Your email address cannot be changed.</p>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="anonymous-default" className="text-base">Default to Anonymous</Label>
                                <p className="text-sm text-muted-foreground">
                                    Set your posts to be anonymous by default. You can still change this per-post.
                                </p>
                            </div>
                            <Switch
                                id="anonymous-default"
                                checked={isAnonymousDefault}
                                onCheckedChange={setIsAnonymousDefault}
                                disabled
                            />
                        </div>
                         <p className="text-sm text-muted-foreground text-center pt-4">Anonymous default setting is coming soon!</p>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}