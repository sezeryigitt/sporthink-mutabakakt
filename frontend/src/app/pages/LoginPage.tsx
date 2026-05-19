import React from "react";
import { Navigate } from "react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { getPostLoginPath } from "../auth/permissions";
import sporthinkLogo from "../../styles/logo/sporthinkLogo.png";

const primaryLoginIdentity = import.meta.env.VITE_MICROSOFT_LOGIN_HINT ?? "sezeryigit2022gmail.onmicrosoft.com";

const allowedDomainsText = "@sporthink.com.tr";

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
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_500px]">
        <section className="relative flex min-h-[46vh] items-center overflow-hidden border-b border-slate-200 bg-[#0c1826] px-6 py-10 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[44px_44px,44px_44px]" />

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
              Pazaryeri mutabakat, komisyon, desi/kargo ve sipariş kârlılığı süreçlerine
              yetkili Microsoft hesabınızla güvenli erişim sağlayın.
            </p>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-medium text-slate-100">Microsoft doğrulama</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <Building2 className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="break-words text-sm font-medium text-slate-100">{allowedDomainsText}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <BadgeCheck className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-medium text-slate-100">Rol bazlı erişim</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-cyan-700">Güvenli erişim</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Sporthink paneline giriş
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Yetkili Microsoft hesabınız doğrulandıktan sonra rolünüze uygun panele yönlendirilirsiniz.
                </p>
              </div>
              <SporthinkLogo />
            </div>

            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <KeyRound className="h-3.5 w-3.5 text-cyan-700" />
                Kabul edilen e-posta
              </div>
              <p className="mt-2 break-all text-sm font-semibold text-slate-900">ad.soyad@sporthink.com.tr</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Bu panel yalnızca Sporthink kurumsal e-posta hesapları için yetkilidir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void login(primaryLoginIdentity)}
              disabled={isBootstrapping}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isBootstrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <MicrosoftMark />}
              <span>{isBootstrapping ? "Yönlendiriliyor..." : "Microsoft ile giriş yap"}</span>
              {!isBootstrapping && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
              <div className="flex gap-3">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-xs leading-5 text-slate-500">
                  Şifre uygulamada saklanmaz; doğrulama Microsoft ekranında tamamlanır.
                </p>
              </div>
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-xs leading-5 text-slate-500">
                  Oturum bilgileriniz tarayıcı oturumu boyunca korunur ve çıkışta temizlenir.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
