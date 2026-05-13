import React from "react";
import { cn } from "../utils/cn";

type StatusVariant =
  | "Uyumlu"
  | "Fark Var"
  | "Manuel İnceleme"
  | "Zarar Eden"
  | "Desi Farkı"
  | "Desi Farkı Var"
  | "Komisyon Farkı"
  | "Doğrulandı"
  | "Hatalı"
  | "Bekliyor"
  | "Aktarıldı"
  | "Açık"
  | "İşlemde"
  | "Çözüldü"
  | "Yok Sayıldı"
  | "Yüksek"
  | "Orta"
  | "Düşük"
  | "Komisyon"
  | "Kargo"
  | "Kârlılık"
  | string;

const variantStyles: Record<string, string> = {
  "Uyumlu": "bg-green-50 text-green-700 border-green-200",
  "Fark Var": "bg-red-50 text-red-700 border-red-200",
  "Komisyon Farkı": "bg-red-50 text-red-700 border-red-200",
  "Desi Farkı": "bg-orange-50 text-orange-700 border-orange-200",
  "Desi Farkı Var": "bg-orange-50 text-orange-700 border-orange-200",
  "Manuel İnceleme": "bg-amber-50 text-amber-700 border-amber-200",
  "Zarar Eden": "bg-red-100 text-red-800 border-red-300",
  "Doğrulandı": "bg-green-50 text-green-700 border-green-200",
  "Hatalı": "bg-red-50 text-red-700 border-red-200",
  "Bekliyor": "bg-slate-100 text-slate-600 border-slate-200",
  "Aktarıldı": "bg-blue-50 text-blue-700 border-blue-200",
  "Açık": "bg-red-50 text-red-700 border-red-200",
  "İşlemde": "bg-blue-50 text-blue-700 border-blue-200",
  "Çözüldü": "bg-green-50 text-green-700 border-green-200",
  "Yok Sayıldı": "bg-slate-100 text-slate-500 border-slate-200",
  "Yüksek": "bg-red-50 text-red-700 border-red-200",
  "Orta": "bg-amber-50 text-amber-700 border-amber-200",
  "Düşük": "bg-slate-100 text-slate-600 border-slate-200",
  "Komisyon": "bg-purple-50 text-purple-700 border-purple-200",
  "Desi/Kargo": "bg-orange-50 text-orange-700 border-orange-200",
  "Kârlılık": "bg-blue-50 text-blue-700 border-blue-200",
};

interface StatusBadgeProps {
  status: StatusVariant;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const style = variantStyles[status] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center border rounded-full whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
