'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Vibe } from '@/lib/types';
import { VibeCard } from '@/components/VibeCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProfileLoading() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      <div className="space-y-2 mb-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-px w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    // If user is done loading and is null or anonymous, redirect to login
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userVibesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'vibes'), orderBy('timestamp', 'desc'));
  }, [firestore, user]);

  const { data: vibes, isLoading: isLoadingVibes } = useCollection<Vibe>(userVibesQuery);

  if (isUserLoading || !user) {
    return <ProfileLoading />;
  }
  
  if (user.isAnonymous) {
      // This is a fallback, useEffect should have already redirected
      return null;
  }

  const userInitial = user.displayName ? user.displayName.charAt(0) : (user.email ? user.email.charAt(0) : '?');

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="flex flex-col sm:flex-row items-center gap-6 mb-12">
        <Avatar className="h-24 w-24 text-4xl">
          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
          <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight">{user.displayName || 'Vibee User'}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Your Vibe Journal</h2>
        <hr className="mb-6"/>
        
        {isLoadingVibes && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <Skeleton className="h-96 w-full rounded-3xl" />
             <Skeleton className="h-96 w-full rounded-3xl" />
           </div>
        )}

        {!isLoadingVibes && vibes && vibes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vibes.map((vibe) => (
              <VibeCard key={vibe.id} vibe={vibe} />
            ))}
          </div>
        )}

        {!isLoadingVibes && (!vibes || vibes.length === 0) && (
            <Card className="col-span-full text-center py-16 bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Your Journal is Empty</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        This is your private space. Post a vibe to start your emotional journey and see your history build up here.
                    </CardDescription>
                </CardHeader>
            </Card>
        )}
      </section>
    </div>
  );
}
