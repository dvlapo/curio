import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi, tokenStore } from '../../api';
import type { AuthUser } from '../../types';
import { queryKeys } from './keys';

export function useCurrentUserQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled,
    retry: false,
  });
}

export function useAuthQueryActions() {
  const queryClient = useQueryClient();

  const clearQueryCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const fetchCurrentUser = useCallback(
    () =>
      queryClient.fetchQuery({
        queryKey: queryKeys.auth.me,
        queryFn: authApi.me,
      }),
    [queryClient],
  );

  const setCurrentUser = useCallback(
    (user: AuthUser) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
    },
    [queryClient],
  );

  return { clearQueryCache, fetchCurrentUser, setCurrentUser };
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useLogoutMutation() {
  const { clearQueryCache } = useAuthQueryActions();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout().catch(() => undefined);
      tokenStore.clear();
      clearQueryCache();
    },
  });
}

export function useUpdateProfileMutation() {
  const { setCurrentUser } = useAuthQueryActions();

  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      setCurrentUser(user);
      toast.success('Profile updated');
    },
  });
}
