import React from "react";
import { NavLink } from "react-router";
import {
  AlertCircle,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { canAccessPath, formatRoleLabel, getInitials } from "../auth/permissions";
import { aktarimKayitlari, kuyrukKayitlari } from "../data/mockData";
import { cn } from "../utils/cn";
import sporthinkFavicon from "../../styles/logo/favicon.ico";

const acikKuyruk = kuyrukKayitlari.filter((k) => k.durum === "Açık").length;
const bekleyenAktarim = aktarimKayitlari.filter(
  (k) => k.durum === "Bekliyor" || k.durum === "Hatalı",
).length;

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Yönetim Özeti" },
  {
    to: "/veri-aktarimi",
    icon: Upload,
    label: "Veri Aktarımı",
    badge: bekleyenAktarim > 0 ? bekleyenAktarim : undefined,
  },
  { to: "/komisyon-mutabakati", icon: ReceiptText, label: "Komisyon Mutabakatı" },
  { to: "/desi-kargo-mutabakati", icon: Package, label: "Desi/Kargo Mutabakatı" },
  { to: "/siparis-karliligi", icon: TrendingUp, label: "Sipariş Karlılığı" },
  {
    to: "/fark-inceleme-kuyrugu",
    icon: AlertCircle,
    label: "Fark İnceleme Kuyruğu",
    badge: acikKuyruk > 0 ? acikKuyruk : undefined,
  },
  { to: "/pazaryeri-ayarlari", icon: Settings, label: "Pazaryeri Ayarları" },
  { to: "/kullanicilar-ve-loglar", icon: Users, label: "Kullanıcılar ve Loglar" },
];

export function Sidebar() {
  const { session, logout } = useAuth();
  const user = session?.user;
  const visibleNavItems = navItems.filter((item) => canAccessPath(user, item.to));
  const displayName = user?.ad_soyad || user?.eposta || "Sporthink Kullanıcısı";

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-lg">
            <img src={sporthinkFavicon} alt="Sporthink" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Sporthink</p>
            <p className="text-xs leading-tight text-slate-400">Mutabakat Paneli</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Navigasyon
        </p>
        <div className="space-y-0.5">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                    )}
                  />
                  <span className="flex-1 text-xs leading-none">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white",
                        isActive ? "bg-blue-400" : "bg-red-500",
                      )}
                      style={{ fontSize: "10px" }}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="mb-4 flex w-full items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Çıkış yap
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <span className="text-xs font-semibold text-white">{getInitials(displayName)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-200">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{formatRoleLabel(user?.roller)}</p>
          </div>
          <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" title="Çevrimiçi" />
        </div>
      </div>
    </aside>
  );
}
