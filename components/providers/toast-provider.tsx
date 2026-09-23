"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          fontSize: "0.875rem",
        },
        success: { iconTheme: { primary: "var(--primary)", secondary: "var(--primary-foreground)" } },
        error: { duration: 4000 },
      }}
    />
  );
}
