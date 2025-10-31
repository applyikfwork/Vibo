import Link from 'next/link';
import { UserCircle, BarChart3 } from 'lucide-react';
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
