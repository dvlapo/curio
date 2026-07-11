import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi, tokenStore } from '../api';
import type { AuthUser, Role } from '../types';

type AuthStatus = 'loading' | 'anonymous' | 'authenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Exclude<Role, 'ADMIN'>;
  }) => Promise<AuthUser>;
  updateProfile: (input: {
    firstName?: string;
    lastName?: string;
    password?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  canAccess: (roles?: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(tokenStore.get()));

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: hasToken,
    retry: false,
  });

  const logout = useCallback(() => {
    tokenStore.clear();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const onUnauthorized = () => {
      if (tokenStore.get()) return;
      setHasToken(false);
      queryClient.clear();
      toast.warning('Your session expired. Please sign in again.');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () =>
      window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      tokenStore.set(result.access_token);
      setHasToken(true);
      return queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.me,
      });
    },
    [queryClient],
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: Exclude<Role, 'ADMIN'>;
    }) => {
      const result = await authApi.register(input);
      tokenStore.set(result.access_token);
      setHasToken(true);
      return queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.me,
      });
    },
    [queryClient],
  );

  const updateProfile = useCallback(
    async (input: {
      firstName?: string;
      lastName?: string;
      password?: string;
    }) => {
      const user = await authApi.updateMe(input);
      queryClient.setQueryData(['auth', 'me'], user);
      return user;
    },
    [queryClient],
  );

  const user = meQuery.data ?? null;
  const status: AuthStatus =
    hasToken && meQuery.isLoading
      ? 'loading'
      : user
        ? 'authenticated'
        : 'anonymous';

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login,
      register,
      updateProfile,
      logout,
      canAccess: (roles?: Role[]) =>
        Boolean(user && (!roles || roles.includes(user.role))),
    }),
    [login, logout, register, status, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
