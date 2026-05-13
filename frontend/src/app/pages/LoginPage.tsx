import React from "react";
import { Navigate } from "react-router";
import { ArrowRight, Building2, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { getPostLoginPath } from "../auth/permissions";
import sporthinkLogo from "../../styles/logo/sporthinkLogo.png";

const allowedDomains = (import.meta.env.VITE_MICROSOFT_ALLOWED_DOMAINS ?? "sporthink.com.tr")
  .split(",")
  .map((domain) => domain.trim())
  .filter(Boolean);

const allowedDomainsText = allowedDomains.map((domain) => `@${domain}`).join(" / ");

function MicrosoftMark() {
  return (
    <span className="grid h-4 w-4 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  );
}

function SporthinkLogo() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
      <img src={sporthinkLogo} alt="Sporthink" className="h-full w-full object-contain p-2" />
    </div>
  );
}

export default function LoginPage() {
  const { session, isAuthenticated, isBootstrapping, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getPostLoginPath(session?.user)} replace />;
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="relative flex min-h-[46vh] items-center overflow-hidden border-b border-slate-200 bg-[#0c1826] px-6 py-10 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[auto,44px_44px,44px_44px]" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-10 flex items-center gap-4">
              <SporthinkLogo />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Sporthink</p>
                <h1 className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  E-Ticaret Mutabakat Platformu
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Pazaryeri, komisyon, desi ve sipariş karlılığı kontrollerini tek güvenli
              operasyon panelinde izleyin.
            </p>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-medium text-slate-100">Microsoft doğrulama</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <Building2 className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="break-words text-sm font-medium text-slate-100">{allowedDomainsText}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <p className="text-sm font-medium text-cyan-700">Kurumsal giriş</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Microsoft hesabı ile devam edin
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Şifreniz uygulamaya gelmez. Kimlik doğrulama Microsoft ekranında tamamlanır.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void login()}
              disabled={isBootstrapping}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isBootstrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <MicrosoftMark />}
              <span>{isBootstrapping ? "Yönlendiriliyor..." : "Microsoft ile giriş yap"}</span>
              {!isBootstrapping && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>

            <p className="mt-6 text-xs leading-5 text-slate-500">
              Başarılı girişten sonra Sporthink oturumu açılır ve uygulamaya giriş yapılır.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
