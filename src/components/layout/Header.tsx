'use client';

import Link from 'next/link';
import { UserCircle, BarChart3, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

function UserMenu() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged out', description: 'You have been successfully signed out.' });
    } catch (error) {
      console.error('Logout Error:', error);
      toast({ variant: 'destructive', title: 'Logout failed', description: 'Could not log you out. Please try again.' });
    }
  };

  if (isUserLoading) {
    return <Button variant="ghost" size="icon" className="h-9 w-9 animate-pulse bg-muted rounded-full" />;
  }

  if (user && !user.isAnonymous) {
    const userInitial = user.displayName ? user.displayName.charAt(0) : (user.email ? user.email.charAt(0) : '?');
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
              <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="sr-only">User Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild variant="ghost">
      <Link href="/login">
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Link>
    </Button>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block">Vibee OS</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/history"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Mood History
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <Link href="/history" className="md:hidden">
              <Button variant="ghost" size="icon">
                <BarChart3 className="h-5 w-5" />
                <span className="sr-only">Mood History</span>
              </Button>
            </Link>
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
