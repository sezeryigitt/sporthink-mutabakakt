import { readSession } from "./session";
import type { AuthSession } from "./session";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: AuthSession["user"];
};

export async function exchangeMicrosoftToken(idToken: string): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/microsoft/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_token: idToken }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(resolveApiError(body, "Microsoft girisi tamamlanamadi."));
  }

  return mapLoginResponse(body as LoginResponse);
}

export async function fetchCurrentUser(): Promise<AuthSession["user"]> {
  const response = await apiFetch("/auth/me");
  const body = await response.json();

  if (!response.ok) {
    throw new Error(resolveApiError(body, "Oturum bilgisi okunamadi."));
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("data" in body)
  ) {
    throw new Error("Oturum bilgisi gecersiz.");
  }

  return (body as { data: AuthSession["user"] }).data;
}

export type AdminUsersLogsResponse = {
  kullanicilar: Array<{
    kullanici_id: string;
    eposta: string;
    ad_soyad: string;
    giris_saglayici: string;
    aktif_mi: boolean;
    son_giris_zamani: string | null;
    olusturma_zamani: string;
    roller: string[];
    rol_adlari: string[];
  }>;
  denetim_loglari: Array<{
    denetim_log_id: string;
    kullanici_id: string | null;
    kullanici_ad_soyad: string | null;
    kullanici_eposta: string | null;
    aksiyon: string;
    varlik_adi: string | null;
    varlik_id: string | null;
    ip_adresi: string | null;
    olusturma_zamani: string;
  }>;
  istatistikler: {
    toplam_kullanici: number;
    aktif_kullanici: number;
    bugun_girisler: number;
    bugun_islemler: number;
  };
};

export async function fetchAdminUsersLogs(): Promise<AdminUsersLogsResponse> {
  const response = await apiFetch("/admin/kullanicilar-loglar");
  const body = await response.json();

  if (!response.ok) {
    throw new Error(resolveApiError(body, "Kullanici ve log verileri okunamadi."));
  }

  return (body as { data: AdminUsersLogsResponse }).data;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const session = readSession();
  const headers = new Headers(init.headers);

  if (session?.accessToken) {
    headers.set("Authorization", `${session.tokenType} ${session.accessToken}`);
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });
}

function resolveApiError(body: unknown, fallback: string) {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body
  ) {
    const message = (body as { message?: string | string[] }).message;
    return Array.isArray(message) ? message.join(" ") : message ?? fallback;
  }

  return fallback;
}

function mapLoginResponse(body: LoginResponse): AuthSession {
  return {
    accessToken: body.access_token,
    tokenType: body.token_type,
    expiresIn: body.expires_in,
    user: body.user,
  };
}
