"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Silently refreshes the session every 45 minutes.
// If refresh fails (both tokens dead), redirects to login.
export default function SessionRefresher() {
  const router = useRouter();

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.status === 401) {
          router.push("/login");
        }
      } catch {}
    };

    // Refresh once on mount (handles page reload after token expiry)
    refresh();

    // Then every 45 minutes (token lives 1 hour)
    const interval = setInterval(refresh, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
