'use client';

import Link from 'next/link';
import { UserCircle, BarChart3, LogOut, Settings, User, Shield, MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { RewardsWidget } from '@/components/RewardsWidget';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState } from 'react';

const ADMIN_EMAIL = 'xyzapplywork@gmail.com';

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
    const isAdmin = user.email === ADMIN_EMAIL;

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
          {isAdmin && (
             <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
          )}
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

function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300">
          <Menu className="h-6 w-6 text-purple-600" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-xl">
                Vibee OS
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <SheetClose asChild>
            <Link
              href="/geovibe"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300 font-semibold"
            >
              <span className="text-2xl">🌍</span>
              <span>GeoVibe</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/emotion-feed"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 transition-all duration-300 font-semibold"
            >
              <span className="text-2xl">🎧</span>
              <span>Emotion Reels</span>
              <span className="ml-auto text-[10px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full font-bold">
                NEW
              </span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/gamification"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 font-semibold"
            >
              <span className="text-2xl">🎮</span>
              <span>Rewards</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/hubs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 font-semibold"
            >
              <span className="text-2xl">🏘️</span>
              <span>Hubs</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/history"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300 font-semibold"
            >
              <span className="text-2xl">📊</span>
              <span>Mood History</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/student-hub"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300 font-semibold"
            >
              <span className="text-2xl">📚</span>
              <span>Student Hub</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/parent-dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all duration-300 font-semibold"
            >
              <span className="text-2xl">💛</span>
              <span>Parent Dashboard</span>
            </Link>
          </SheetClose>
          {isAdmin && (
            <SheetClose asChild>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 transition-all duration-300 font-semibold"
              >
                <Shield className="h-6 w-6" />
                <span>Admin Panel</span>
              </Link>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-purple-200/50 bg-gradient-to-r from-purple-50/95 via-pink-50/95 to-blue-50/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg shadow-purple-500/10">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4">
        <MobileNav />
        <div className="mr-4 flex flex-1 md:flex-initial">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <Logo />
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-lg">
              Vibee OS
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm ml-6">
          <Link
            href="/geovibe"
            className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text font-semibold flex items-center gap-1"
          >
            🌍 GeoVibe
          </Link>
          <Link
            href="/emotion-feed"
            className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:bg-clip-text font-semibold flex items-center gap-1 group"
          >
            🎧 Emotion Reels
            <span className="ml-1 text-[10px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              NEW
            </span>
          </Link>
          <Link
            href="/gamification"
            className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-yellow-600 hover:to-orange-600 hover:bg-clip-text font-semibold flex items-center gap-1"
          >
            🎮 Rewards
          </Link>
          <Link
            href="/hubs"
            className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:bg-clip-text font-semibold flex items-center gap-1"
          >
            🏘️ Hubs
          </Link>
          <Link
            href="/history"
            className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text font-semibold"
          >
            Mood History
          </Link>
          <Link
            href="/student-hub"
            className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text font-semibold"
          >
            📚 Student Hub
          </Link>
          <Link
            href="/parent-dashboard"
            className="text-foreground/70 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-green-600 hover:to-blue-600 hover:bg-clip-text font-semibold"
          >
            💛 Parent Dashboard
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-2 md:gap-3">
            <RewardsWidget />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
