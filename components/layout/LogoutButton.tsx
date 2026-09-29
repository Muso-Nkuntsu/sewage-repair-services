"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      // Full reload so every server component forgets the old session.
      window.location.href = "/login";
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleLogout} loading={loading} loadingText="Logging out...">
      Logout
    </Button>
  );
}
