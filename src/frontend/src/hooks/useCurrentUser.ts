import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';
import type { UserRole, UserProfile } from '../backend';

export function useCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  const roleQuery = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  const isAdmin = roleQuery.data === 'admin';
  const isLoading = actorFetching || roleQuery.isLoading || profileLoading;

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    userProfile,
    role: roleQuery.data,
  };
}
