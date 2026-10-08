"use client";

import { useEffect, useState } from "react";
import type { Route, SavedScore, User } from "@/lib/types";
import Nav from "@/components/nav";
import Library from "@/components/library";
import GameDetail from "@/components/game-detail";
import Auth from "@/components/auth";
import GamePlayer from "@/components/game-player";
import HallOfFame from "@/components/hall-of-fame";
import Home from "@/components/home";

const HOME: Route = { name: "home" };

function parseRoute(value: unknown): Route {
  if (typeof value !== "object" || value === null) return HOME;
  const r = value as { name?: unknown; id?: unknown };
  switch (r.name) {
    case "home":
    case "biblioteca":
    case "auth":
    case "salon":
      return { name: r.name };
    case "detalle":
    case "player":
      return typeof r.id === "string" ? { name: r.name, id: r.id } : HOME;
    default:
      return HOME;
  }
}

// Hash legible: #/ · #/biblioteca · #/juego/<id> · #/jugar/<id> · #/acceso · #/salon
function routeToHash(r: Route): string {
  switch (r.name) {
    case "biblioteca":
      return "#/biblioteca";
    case "detalle":
      return `#/juego/${encodeURIComponent(r.id)}`;
    case "player":
      return `#/jugar/${encodeURIComponent(r.id)}`;
    case "auth":
      return "#/acceso";
    case "salon":
      return "#/salon";
    default:
      return "#/";
  }
}

function hashToRoute(hash: string): Route {
  const [seg, id] = hash.replace(/^#\/?/, "").split("/");
  const gameId = id ? decodeURIComponent(id) : "";
  switch (seg) {
    case "biblioteca":
      return { name: "biblioteca" };
    case "juego":
      return gameId ? { name: "detalle", id: gameId } : HOME;
    case "jugar":
      return gameId ? { name: "player", id: gameId } : HOME;
    case "acceso":
      return { name: "auth" };
    case "salon":
      return { name: "salon" };
    default:
      return HOME;
  }
}

function readHashRoute(): Route {
  try {
    const h = location.hash;
    if (!h) return HOME;
    // Compatibilidad con enlaces viejos (JSON codificado).
    if (h.startsWith("#%7B") || h.startsWith("#{"))
      return parseRoute(JSON.parse(decodeURIComponent(h.slice(1))));
    return hashToRoute(h);
  } catch {}
  return HOME;
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
  const [route, setRoute] = useState<Route>(HOME);
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
      location.hash = routeToHash(route);
    } catch {}
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route, ready]);

  const navigate = (r: Route) => setRoute(r);

  // `null` = invitado: sin usuario y sin `av_user`.
  const onLogin = (u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem("av_user", JSON.stringify(u));
      else localStorage.removeItem("av_user");
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

  let screen: React.ReactNode = null;
  if (route.name === "home") screen = <Home navigate={navigate} />;
  else if (route.name === "biblioteca")
    screen = <Library navigate={navigate} />;
  else if (route.name === "detalle")
    screen = <GameDetail id={route.id} navigate={navigate} />;
  else if (route.name === "player")
    screen = (
      <GamePlayer
        id={route.id}
        user={user}
        navigate={navigate}
        onSaveScore={onSaveScore}
      />
    );
  else if (route.name === "auth")
    screen = <Auth navigate={navigate} onLogin={onLogin} />;
  else if (route.name === "salon")
    screen = <HallOfFame user={user} navigate={navigate} />;

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
