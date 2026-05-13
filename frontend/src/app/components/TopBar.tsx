import React, { useState } from "react";
import { Bell, Calendar, ChevronDown, RefreshCw } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { getInitials } from "../auth/permissions";
import { aktarimKayitlari, kuyrukKayitlari } from "../data/mockData";
import { cn } from "../utils/cn";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const totalAlerts =
  kuyrukKayitlari.filter((k) => k.durum === "Açık").length +
  aktarimKayitlari.filter((k) => k.durum === "Hatalı").length;

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { session } = useAuth();
  const displayName = session?.user.ad_soyad || session?.user.eposta || "Sporthink Kullanıcısı";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold leading-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs leading-tight text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actions}

          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-100">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Nisan 2026</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          <button
            onClick={handleRefresh}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-500", isRefreshing && "animate-spin")} />
          </button>

          <div className="relative">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 transition-colors hover:bg-slate-50">
              <Bell className="h-3.5 w-3.5 text-slate-500" />
            </button>
            {totalAlerts > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-medium text-white"
                style={{ fontSize: "9px" }}
              >
                {totalAlerts}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
              <span className="text-xs font-semibold text-white">{getInitials(displayName)}</span>
            </div>
            <span className="hidden max-w-40 truncate text-xs text-slate-600 md:block">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
