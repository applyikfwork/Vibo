'use client';

import Link from 'next/link';
import { UserCircle, BarChart3, LogOut, Settings, User } from 'lucide-react';
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
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Guest/Anonymous user view
  return (
    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
      <Link href="/login" aria-label="Login">
        <UserCircle className="h-6 w-6" />
      </Link>
    </Button>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-purple-200/50 bg-gradient-to-r from-purple-50/95 via-pink-50/95 to-blue-50/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg shadow-purple-500/10">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <Logo />
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-lg">
              Vibee OS
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/history"
              className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text font-semibold"
            >
              Mood History
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <Link href="/history" className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300">
                <BarChart3 className="h-5 w-5 text-purple-600" />
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
