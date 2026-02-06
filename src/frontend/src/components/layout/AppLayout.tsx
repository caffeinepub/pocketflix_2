import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { useTheme } from '../../hooks/useTheme';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isLoading, isError } = useTheme();
  
  // Show a minimal loading state if theme is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If there's an error loading theme, still render the app with default theme
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
