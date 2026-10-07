"use client";

import { useState } from "react";
import type { Route, SavedScore, User } from "@/lib/types";

export default function AppShell() {
  const [route, setRoute] = useState<Route>({ name: "biblioteca" });
  const [user, setUser] = useState<User | null>(null);

  const navigate = (r: Route) => setRoute(r);

  const onLogin = (u: User) => {
    setUser(u);
    try {
      localStorage.setItem("av_user", JSON.stringify(u));
    } catch {}
  };

  const onSignOut = () => {
    setUser(null);
    try {
      localStorage.removeItem("av_user");
    } catch {}
  };

  const onSaveScore = (entry: Omit<SavedScore, "at">) => {
    try {
      const all: SavedScore[] = JSON.parse(
        localStorage.getItem("av_scores") || "[]",
      );
      all.push({ ...entry, at: Date.now() });
      localStorage.setItem("av_scores", JSON.stringify(all));
    } catch {}
  };

  // Las pantallas se conectan en los pasos 5-10; los handlers se usarán entonces.
  void navigate;
  void onLogin;
  void onSignOut;
  void onSaveScore;

  void user;

  // Pasos 5-10 sustituyen este placeholder por Nav y las 5 pantallas.
  const screen: React.ReactNode = route.name;

  return (
    <>
      <main className="av-main">{screen}</main>
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          padding: "20px 32px",
          textAlign: "center",
          color: "var(--ink-faint)",
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.16em",
        }}
      >
        © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
      </footer>
    </>
  );
}
