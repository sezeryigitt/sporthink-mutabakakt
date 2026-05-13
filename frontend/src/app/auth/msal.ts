import {
  BrowserCacheLocation,
  LogLevel,
  ProtocolMode,
  PublicClientApplication,
} from "@azure/msal-browser";

const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID ?? "";
const authority =
  import.meta.env.VITE_MICROSOFT_AUTHORITY ??
  (tenantId ? `https://login.microsoftonline.com/${tenantId}` : "https://login.microsoftonline.com/organizations");

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID ?? "",
    authority,
    OIDCOptions: {
      defaultScopes: ["openid", "profile", "email"],
    },
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI ?? window.location.origin,
    postLogoutRedirectUri: window.location.origin + "/login",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
    storeAuthStateInCookie: false,
  },
  system: {
    protocolMode: ProtocolMode.OIDC,
    loggerOptions: {
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
    },
  },
});

export const microsoftLoginRequest = {
  scopes: ["openid", "profile", "email"],
  prompt: "select_account" as const,
};
