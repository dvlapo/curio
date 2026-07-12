import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { tokenStore } from '../api';
import {
  useAuthQueryActions,
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
} from '../hooks/queries';
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
  logout: () => Promise<void>;
  canAccess: (roles?: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [hasSession, setHasSession] = useState(() => tokenStore.hasSession());
  const meQuery = useCurrentUserQuery(hasSession);
  const { clearQueryCache, fetchCurrentUser } = useAuthQueryActions();
  const { mutateAsync: loginWithPassword } = useLoginMutation();
  const { mutateAsync: registerAccount } = useRegisterMutation();
  const { mutateAsync: logoutSession } = useLogoutMutation();
  const { mutateAsync: updateProfileMutation } = useUpdateProfileMutation();

  const logout = useCallback(async () => {
    await logoutSession();
    setHasSession(false);
  }, [logoutSession]);

  useEffect(() => {
    const onUnauthorized = () => {
      if (tokenStore.hasSession()) return;
      setHasSession(false);
      clearQueryCache();
      toast.warning('Your session expired. Please sign in again.');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () =>
      window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [clearQueryCache]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginWithPassword({ email, password });
      tokenStore.set(result);
      setHasSession(true);
      return fetchCurrentUser();
    },
    [fetchCurrentUser, loginWithPassword],
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: Exclude<Role, 'ADMIN'>;
    }) => {
      const result = await registerAccount(input);
      tokenStore.set(result);
      setHasSession(true);
      return fetchCurrentUser();
    },
    [fetchCurrentUser, registerAccount],
  );

  const updateProfile = useCallback(
    async (input: {
      firstName?: string;
      lastName?: string;
      password?: string;
    }) => {
      return updateProfileMutation(input);
    },
    [updateProfileMutation],
  );

  const user = meQuery.data ?? null;
  const status: AuthStatus =
    hasSession && meQuery.isLoading
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
