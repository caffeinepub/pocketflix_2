import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';

export function useCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Use isCallerAdmin for direct admin status check
  const adminQuery = useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
    staleTime: 0, // Always refetch to ensure fresh admin status
  });

  const isAdmin = adminQuery.data === true;
  const isLoading = actorFetching || adminQuery.isLoading || profileLoading;

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    userProfile,
    isAdminLoaded: adminQuery.isFetched,
  };
}
