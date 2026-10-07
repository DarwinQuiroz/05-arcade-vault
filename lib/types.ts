export type GameColor = "cyan" | "magenta" | "yellow" | "green";
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export interface Game {
  id: string; // "bloque-buster", "caida", ...
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS: "cover-bricks", "cover-tetro", ...
  color: GameColor;
  best: number;
  plays: string; // "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/2026"
}

export interface User {
  name: string; // MAYÚSCULAS, máx. 10 caracteres
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

export type Route =
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };
