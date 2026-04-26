"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        className: "!bg-slate-900 !border !border-purple-400/30 !text-slate-100",
      }}
    />
  );
}
