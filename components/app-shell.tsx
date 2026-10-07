"use client";

import { useEffect, useState } from "react";
import type { Route, SavedScore, User } from "@/lib/types";
import Nav from "@/components/nav";
import Library from "@/components/library";
import GameDetail from "@/components/game-detail";

const BIBLIOTECA: Route = { name: "biblioteca" };

function parseRoute(value: unknown): Route {
  if (typeof value !== "object" || value === null) return BIBLIOTECA;
  const r = value as { name?: unknown; id?: unknown };
  switch (r.name) {
    case "auth":
    case "salon":
      return { name: r.name };
    case "detalle":
    case "player":
      return typeof r.id === "string" ? { name: r.name, id: r.id } : BIBLIOTECA;
    default:
      return BIBLIOTECA;
  }
}

function readHashRoute(): Route {
  try {
    const h = location.hash.replace(/^#/, "");
    if (h) return parseRoute(JSON.parse(decodeURIComponent(h)));
  } catch {}
  return BIBLIOTECA;
}

function readStoredUser(): User | null {
  try {
    const u = JSON.parse(localStorage.getItem("av_user") || "null");
    return u && typeof u.name === "string" ? { name: u.name } : null;
  } catch {
    return null;
  }
}

export default function AppShell() {
  // Primer render fijo (igual que el servidor); la lectura real ocurre tras el montaje.
  const [route, setRoute] = useState<Route>(BIBLIOTECA);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Sincroniza con hash y localStorage (sistemas externos) una sola vez tras el montaje;
    // leerlos en el primer render causaría hydration mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    setRoute(readHashRoute());
    setUser(readStoredUser());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      location.hash = encodeURIComponent(JSON.stringify(route));
    } catch {}
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route, ready]);

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
  void onLogin;
  void onSaveScore;

  // Pasos 8-10 sustituyen el placeholder por las demás pantallas.
  let screen: React.ReactNode = route.name;
  if (route.name === "biblioteca") screen = <Library navigate={navigate} />;
  else if (route.name === "detalle")
    screen = <GameDetail id={route.id} navigate={navigate} />;

  return (
    <>
      <Nav
        route={route}
        navigate={navigate}
        user={user}
        onSignOut={onSignOut}
      />
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
