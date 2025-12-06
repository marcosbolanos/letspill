import { useContext, createContext, type PropsWithChildren, useEffect } from 'react';
import { authClient } from './auth-client';

type UseSessionType = ReturnType<typeof authClient.useSession>

type SessionData = UseSessionType["data"]

export type AuthContextValue = {
  session: SessionData,
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
});

export function SessionProvider({ children }: PropsWithChildren) {
  const { data: session, isPending } = authClient.useSession()
  
  if (isPending) {
    return null; // or a loading spinner
  }
  
  return (
    <AuthContext.Provider
      value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
