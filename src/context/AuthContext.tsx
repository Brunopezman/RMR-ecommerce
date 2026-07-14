import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthState } from '../types/auth';
import {
  login as apiLogin,
  loadAuthState,
  saveAuthState,
  clearAuthState,
} from '../services/authService';

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(() => loadAuthState());

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    saveAuthState(result.user, result.token);
    setAuthState({
      user: result.user,
      token: result.token,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
    setAuthState({ user: null, token: null, isAuthenticated: false });
  }, []);

  // Re-hydrate from localStorage on mount (in case of cross-tab changes)
  useEffect(() => {
    const stored = loadAuthState();
    if (stored.isAuthenticated !== authState.isAuthenticated) {
      setAuthState(stored);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
