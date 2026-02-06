import { Link } from '@tanstack/react-router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useGetSettingsData } from '../../hooks/useQueries';
import LoginButton from '../auth/LoginButton';
import ShowSomeLoveButton from '../donations/ShowSomeLoveButton';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function AppHeader() {
  const { isAuthenticated, isAdmin, isAdminLoaded } = useCurrentUser();
  const { data: settingsData } = useGetSettingsData();

  const logoUrl = settingsData?.adminConfig?.logo?.getDirectURL() || '/assets/generated/pocketflix-logo.dim_512x512.png';

  // Only show admin link when we've confirmed admin status
  const showAdminLink = isAuthenticated && isAdminLoaded && isAdmin;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logoUrl} 
              alt="Pocketflix" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--theme-primary,#fb8c00)] to-[var(--theme-secondary,#04032e)] bg-clip-text text-transparent">
              Pocketflix
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/account" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                My Account
              </Link>
            )}
            {showAdminLink && (
              <Link 
                to="/admin" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ShowSomeLoveButton />
          <LoginButton />
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/" 
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/account" 
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    My Account
                  </Link>
                )}
                {showAdminLink && (
                  <Link 
                    to="/admin" 
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
