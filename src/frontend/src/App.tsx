import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCurrentUser } from './hooks/useCurrentUser';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AppLayout from './components/layout/AppLayout';
import AccessDeniedScreen from './components/auth/AccessDeniedScreen';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

function AccountRouteComponent() {
  const { identity } = useInternetIdentity();
  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access your account." />;
  }
  return <AccountPage />;
}

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: AccountRouteComponent,
});

function AdminRouteComponent() {
  const { isAdmin, isLoading, isAdminLoaded } = useCurrentUser();
  
  if (isLoading || !isAdminLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <AccessDeniedScreen message="Admin access required." />;
  }
  
  return <AdminDashboardPage />;
}

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminRouteComponent,
});

const routeTree = rootRoute.addChildren([homeRoute, accountRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ProfileSetupModal />
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
