import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { useTheme } from '../../hooks/useTheme';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  useTheme();
  
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
