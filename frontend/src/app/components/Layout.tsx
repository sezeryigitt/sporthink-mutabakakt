import React from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-60 min-w-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
