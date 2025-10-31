'use client';

import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthManager({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();

    useEffect(() => {
        if (!isUserLoading && !user && auth) {
            initiateAnonymousSignIn(auth);
        }
    }, [user, isUserLoading, auth]);

    if (isUserLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                    <p className="text-muted-foreground">Connecting to the vibe...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
