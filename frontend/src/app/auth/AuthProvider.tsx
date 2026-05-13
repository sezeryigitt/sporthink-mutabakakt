import { AuthenticationResult } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { exchangeMicrosoftToken, fetchCurrentUser } from "./api";
import { microsoftLoginRequest } from "./msal";
import { AuthSession, clearSession, readSession, writeSession } from "./session";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  initialMicrosoftResult: AuthenticationResult | null;
};

export function AuthProvider({
  children,
  initialMicrosoftResult,
}: AuthProviderProps) {
  const { instance } = useMsal();
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(initialMicrosoftResult?.idToken));

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      const storedSession = readSession();
      if (!initialMicrosoftResult?.idToken && !storedSession?.accessToken) {
        setIsBootstrapping(false);
        return;
      }

      setIsBootstrapping(true);

      try {
        if (initialMicrosoftResult?.idToken) {
          const appSession = await exchangeMicrosoftToken(initialMicrosoftResult.idToken);

          if (!cancelled) {
            writeSession(appSession);
            setSession(appSession);
            toast.success("Sporthink oturumu açıldı.");
          }

          return;
        }

        if (storedSession?.accessToken) {
          const user = await fetchCurrentUser();
          const refreshedSession: AuthSession = {
            ...storedSession,
            user,
          };

          if (!cancelled) {
            writeSession(refreshedSession);
            setSession(refreshedSession);
          }
        }
      } catch (error) {
        clearSession();
        if (!cancelled) {
          setSession(null);
          toast.error(error instanceof Error ? error.message : "Giris tamamlanamadi.");
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapAuth();
    return () => {
      cancelled = true;
    };
  }, [initialMicrosoftResult]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isBootstrapping,
      async login() {
        await instance.loginRedirect(microsoftLoginRequest);
      },
      async logout() {
        clearSession();
        setSession(null);
        await instance.logoutRedirect();
      },
    }),
    [instance, isBootstrapping, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthProvider eksik.");
  }

  return context;
}
