import React, { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, RefreshCw, Search, Shield, User } from "lucide-react";
import { fetchAdminUsersLogs, type AdminUsersLogsResponse } from "../auth/api";
import { getInitials } from "../auth/permissions";
import { TopBar } from "../components/TopBar";
import { cn } from "../utils/cn";

type SubTab = "Kullanıcılar" | "Denetim Logları";

const aksiyonRengi: Record<string, string> = {
  "auth.microsoft.login_success": "bg-green-50 text-green-700 border-green-200",
  "auth.microsoft.user_created": "bg-blue-50 text-blue-700 border-blue-200",
  "auth.role.admin_assigned": "bg-purple-50 text-purple-700 border-purple-200",
  "auth.microsoft.inactive_user_rejected": "bg-red-50 text-red-700 border-red-200",
  "auth.microsoft.domain_rejected": "bg-red-50 text-red-700 border-red-200",
  "auth.microsoft.token_rejected": "bg-red-50 text-red-700 border-red-200",
  IMPORT: "bg-blue-50 text-blue-700 border-blue-200",
  IMPORT_ERROR: "bg-red-50 text-red-700 border-red-200",
  LOGIN: "bg-green-50 text-green-700 border-green-200",
  QUEUE_UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
  QUEUE_RESOLVE: "bg-green-50 text-green-700 border-green-200",
};

const rolRengi: Record<string, string> = {
  admin: "bg-orange-50 text-orange-700 border-orange-200",
  operasyon: "bg-blue-50 text-blue-700 border-blue-200",
  finans: "bg-purple-50 text-purple-700 border-purple-200",
  goruntuleyici: "bg-green-50 text-green-700 border-green-200",
  READ_ONLY: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function KullanicilarveLogllar() {
  const [activeTab, setActiveTab] = useState<SubTab>("Kullanıcılar");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<AdminUsersLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAdminUsersLogs();
      setData(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Veriler okunamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredKullanicilar = useMemo(() => {
    const query = search.trim().toLowerCase();
    const users = data?.kullanicilar ?? [];

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.ad_soyad,
        user.eposta,
        user.giris_saglayici,
        ...user.roller,
        ...user.rol_adlari,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [data?.kullanicilar, search]);

  const filteredLoglari = useMemo(() => {
    const query = search.trim().toLowerCase();
    const logs = data?.denetim_loglari ?? [];

    if (!query) {
      return logs;
    }

    return logs.filter((log) =>
      [
        log.kullanici_ad_soyad ?? "",
        log.kullanici_eposta ?? "",
        log.aksiyon,
        log.varlik_adi ?? "",
        log.varlik_id ?? "",
        log.ip_adresi ?? "",
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [data?.denetim_loglari, search]);

  const stats = data?.istatistikler ?? {
    toplam_kullanici: 0,
    aktif_kullanici: 0,
    bugun_girisler: 0,
    bugun_islemler: 0,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title="Kullanıcılar ve Loglar"
        subtitle="Kullanıcı yönetimi ve sistem işlem kayıtları"
        actions={
          <button
            onClick={() => void loadData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Yenile
          </button>
        }
      />

      <div className="flex-1 space-y-5 overflow-auto p-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: User, label: "Toplam Kullanıcı", value: stats.toplam_kullanici, color: "text-slate-800 bg-white" },
            { icon: Shield, label: "Aktif Kullanıcı", value: stats.aktif_kullanici, color: "text-green-700 bg-green-50" },
            { icon: Activity, label: "Bugün Giriş", value: stats.bugun_girisler, color: "text-blue-700 bg-blue-50" },
            { icon: Activity, label: "Bugün İşlem", value: stats.bugun_islemler, color: "text-amber-700 bg-amber-50" },
          ].map((item) => (
            <div key={item.label} className={`${item.color} rounded-lg border border-slate-200 px-4 py-3 shadow-sm`}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">{item.label}</p>
                <item.icon className="h-3.5 w-3.5 text-current opacity-70" />
              </div>
              <p className="text-2xl font-semibold">{isLoading ? "-" : item.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200">
            {(["Kullanıcılar", "Denetim Logları"] as SubTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-5 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 bg-blue-50/50 text-blue-600"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}

            <div className="ml-auto flex items-center px-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-52 rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <StateMessage message="Veritabanından kullanıcı ve log verileri okunuyor." />
          )}

          {!isLoading && error && (
            <StateMessage
              tone="error"
              message={error}
              action={
                <button
                  onClick={() => void loadData()}
                  className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Tekrar dene
                </button>
              }
            />
          )}

          {!isLoading && !error && activeTab === "Kullanıcılar" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Ad Soyad", "E-posta", "Rol", "Sağlayıcı", "Durum", "Son Giriş", "Oluşturma Zamanı"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredKullanicilar.map((user) => (
                    <tr key={user.kullanici_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-xs font-medium text-blue-700">{getInitials(user.ad_soyad)}</span>
                          </div>
                          <span className="whitespace-nowrap text-xs font-medium text-slate-800">{user.ad_soyad}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{user.eposta}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(user.roller.length ? user.roller : ["rol_yok"]).map((role, index) => (
                            <span
                              key={`${user.kullanici_id}-${role}`}
                              className={cn(
                                "inline-flex items-center rounded border px-2 py-0.5 text-xs",
                                rolRengi[role] ?? "border-slate-200 bg-slate-100 text-slate-600",
                              )}
                            >
                              {user.rol_adlari[index] ?? role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-slate-500">{user.giris_saglayici}</td>
                      <td className="px-4 py-3 text-xs">
                        {user.aktif_mi ? (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        {formatDate(user.son_giris_zamani)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        {formatDate(user.olusturma_zamani)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredKullanicilar.length === 0 && <EmptyMessage message="Eşleşen kullanıcı bulunamadı." />}
            </div>
          )}

          {!isLoading && !error && activeTab === "Denetim Logları" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Kullanıcı", "Aksiyon", "Varlık Adı", "Varlık ID", "IP Adresi", "Zaman"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLoglari.map((log) => {
                    const actor = log.kullanici_ad_soyad ?? log.kullanici_eposta ?? "Sistem";

                    return (
                      <tr key={log.denetim_log_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200">
                              <span className="text-xs text-slate-600">{getInitials(actor)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs text-slate-700">{actor}</p>
                              {log.kullanici_eposta && (
                                <p className="truncate text-[10px] text-slate-400">{log.kullanici_eposta}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs",
                              aksiyonRengi[log.aksiyon] ?? "border-slate-200 bg-slate-100 text-slate-600",
                            )}
                          >
                            {log.aksiyon}
                          </span>
                        </td>
                        <td className="max-w-64 truncate px-4 py-3 text-xs text-slate-600">{log.varlik_adi ?? "-"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.varlik_id ?? "-"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.ip_adresi ?? "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                          {formatDate(log.olusturma_zamani)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredLoglari.length === 0 && <EmptyMessage message="Eşleşen denetim logu bulunamadı." />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StateMessage({
  message,
  tone = "default",
  action,
}: {
  message: string;
  tone?: "default" | "error";
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-4 py-12 text-center">
      {tone === "error" ? (
        <AlertCircle className="mb-3 h-7 w-7 text-red-500" />
      ) : (
        <RefreshCw className="mb-3 h-7 w-7 animate-spin text-blue-500" />
      )}
      <p className={cn("text-sm", tone === "error" ? "text-red-700" : "text-slate-500")}>{message}</p>
      {action}
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return <div className="px-4 py-10 text-center text-sm text-slate-500">{message}</div>;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const [datePart, timePart = ""] = value.split("T");
  const [year, month, day] = datePart.split("-");
  const [hour = "00", minute = "00"] = timePart.split(":");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year} ${hour}:${minute}`;
}
