
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import App from "./app/App.tsx";
import { AuthProvider } from "./app/auth/AuthProvider";
import { msalInstance } from "./app/auth/msal";
import "./styles/index.css";

async function bootstrap() {
  await msalInstance.initialize();
  const redirectResponse = await msalInstance.handleRedirectPromise();

  createRoot(document.getElementById("root")!).render(
    <MsalProvider instance={msalInstance}>
      <AuthProvider initialMicrosoftResult={redirectResponse}>
        <App />
      </AuthProvider>
    </MsalProvider>,
  );
}

void bootstrap();
