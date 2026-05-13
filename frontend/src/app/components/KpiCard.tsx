import React from "react";
import { cn } from "../utils/cn";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger" | "success" | "warning" | "info";
  trend?: { value: number; label: string };
  className?: string;
}

const variantStyles = {
  default: "border-slate-200",
  danger: "border-l-4 border-l-red-500 border-slate-200",
  success: "border-l-4 border-l-green-500 border-slate-200",
  warning: "border-l-4 border-l-amber-500 border-slate-200",
  info: "border-l-4 border-l-blue-500 border-slate-200",
};

const iconBgStyles = {
  default: "bg-slate-100 text-slate-600",
  danger: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-blue-100 text-blue-600",
};

export function KpiCard({ title, value, subtext, icon, variant = "default", trend, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 mb-1 truncate">{title}</p>
          <p className={cn(
            "text-xl truncate",
            variant === "danger" && "text-red-700",
            variant === "success" && "text-green-700",
            variant === "warning" && "text-amber-700",
            variant === "info" && "text-blue-700",
            variant === "default" && "text-slate-900",
          )}>
            {value}
          </p>
          {subtext && <p className="text-xs text-slate-400 mt-1 truncate">{subtext}</p>}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs",
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}%</span>
              <span className="text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ml-3",
            iconBgStyles[variant]
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
