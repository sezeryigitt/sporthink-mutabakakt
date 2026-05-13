export type AuthSession = {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    kullanici_id: string;
    eposta: string;
    ad_soyad: string;
    roller: string[];
  };
};

const SESSION_KEY = "sporthink.auth.session";

export function readSession(): AuthSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function writeSession(session: AuthSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
