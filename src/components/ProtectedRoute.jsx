import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Start with whatever Zustand already knows — may already be true on hot reloads
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const location = useLocation();

  useEffect(() => {
    if (hydrated) return;
    // Subscribe before re-checking so we never miss the event
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    // Re-check in case hydration completed between the initial render and this effect
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  // Hold rendering until the persisted auth state has been read from cookies
  if (!hydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
