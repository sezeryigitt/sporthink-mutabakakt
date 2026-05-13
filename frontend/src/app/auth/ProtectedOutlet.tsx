import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import { canAccessPath, getPostLoginPath } from "./permissions";

export function ProtectedOutlet() {
  const { session, isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          Sporthink oturumu doğrulanıyor
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!canAccessPath(session?.user, location.pathname)) {
    return <Navigate to={getPostLoginPath(session?.user)} replace />;
  }

  return <Outlet />;
}
