import type { AuthSession } from "./session";

type AuthUser = AuthSession["user"];

const restrictedForOperation = new Set(["/", "/kullanicilar-ve-loglar"]);
const operationLandingPath = "/veri-aktarimi";

export function isAdmin(user: AuthUser | null | undefined) {
  return hasRole(user, "admin");
}

export function hasRole(user: AuthUser | null | undefined, role: string) {
  return Boolean(user?.roller.some((userRole) => userRole.toLowerCase() === role.toLowerCase()));
}

export function canAccessPath(user: AuthUser | null | undefined, pathname: string) {
  if (!user) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  return !restrictedForOperation.has(normalizePath(pathname));
}

export function getPostLoginPath(user: AuthUser | null | undefined) {
  if (isAdmin(user)) {
    return "/";
  }

  if (hasRole(user, "operasyon")) {
    return operationLandingPath;
  }

  return operationLandingPath;
}

export function getInitials(nameOrEmail: string | null | undefined) {
  const value = (nameOrEmail ?? "").trim();
  if (!value) {
    return "ST";
  }

  const source = value.includes("@") ? value.split("@")[0].replace(/[._-]+/g, " ") : value;
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "ST";
}

export function formatRoleLabel(roles: string[] | undefined) {
  if (!roles?.length) {
    return "Rol atanmamis";
  }

  const role = roles[0].toLowerCase();
  const labels: Record<string, string> = {
    admin: "Sistem Yoneticisi",
    operasyon: "Operasyon Kullanicisi",
    finans: "Finans Kullanicisi",
    goruntuleyici: "Goruntuleyici",
    read_only: "Salt Okuma",
  };

  return labels[role] ?? roles[0];
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}
