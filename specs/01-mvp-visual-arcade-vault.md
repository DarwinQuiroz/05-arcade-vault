# SPEC 01 — MVP visual de Arcade Vault

> **Status:** Implementado
> **Depends on:** —
> **Date:** 2026-10-07
> **Objective:** Portar a Next.js las 5 pantallas de `references/templates/` (biblioteca, detalle, reproductor, auth y salón de la fama) como un MVP solo visual, con datos mock y sin ningún juego real.

---

## Por qué esta spec existe

Las plantillas son un prototipo HTML con React por CDN y Babel. Esta spec las convierte en código del proyecto (Next 16, TypeScript) conservando el diseño píxel a píxel. La lógica de juego y el backend vienen después.

El CSS y el layout ya están portados (commit `5cb8d1b`): `app/globals.css` (955 líneas, clases `av-*`) y `app/layout.tsx` (fuentes Press Start 2P, JetBrains Mono y Courier Prime vía `next/font/google`, fondo `av-bg` y `av-noise`). Esta spec cubre los componentes y la navegación.

## Alcance

**Dentro:**

- Las 5 pantallas de la plantilla: `Library`, `GameDetail`, `GamePlayer`, `Auth`, `HallOfFame`.
- `Nav` (con menú móvil lateral) y footer, tal como en `app.jsx` y `nav.jsx`.
- Navegación SPA basada en hash, como la plantilla: una sola ruta de Next (`/`) y el estado de pantalla en `location.hash`.
- Datos mock tipados: 8 juegos, categorías y `seededScores()`.
- Sesión mock en `localStorage` (`av_user`): el `Nav` y el Salón reaccionan al usuario.
- Reproductor con simulación: arena CRT decorativa, puntuación simulada por timer, pausa, FIN, salir y modal de fin de juego que guarda la marca en `localStorage` (`av_scores`).
- Buscador y chips de categoría en la biblioteca, tabs por juego en el Salón, estado vacío "NO HAY RESULTADOS".
- Reemplazar el `app/page.tsx` de Create Next App.
- Tipos TypeScript para todo lo anterior.

**Fuera de alcance (specs futuras):**

- Cualquier juego real (lógica, canvas, controles).
- Backend, base de datos, API routes o Server Actions.
- Autenticación real: validación, hashing, sesiones, OAuth con Google/GitHub (los botones son decorativos).
- Rutas reales del App Router (`/juegos/[id]`, etc.).
- Leer `av_scores` para mostrarlos en el detalle o el Salón (solo se escriben).
- Tests automatizados (el proyecto no tiene runner).
- Modo claro: el diseño es solo oscuro.
- Contador de créditos funcional (el "CRÉDITOS · 03" es texto fijo).

## Modelo de datos

```ts
// lib/types.ts
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
  date: string;
} // date: "DD/MM/2026"
export interface User {
  name: string;
} // MAYÚSCULAS, máx. 10 caracteres
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
```

Persistencia (`localStorage`):

- `av_user`: JSON de `User | null`. Se borra al cerrar sesión.
- `av_scores`: JSON de `SavedScore[]`. Solo se agrega, nunca se lee en este MVP.

Convenciones:

- La ruta se serializa en el hash como `#` + `encodeURIComponent(JSON.stringify(route))`, igual que la plantilla.
- Los números se formatean con `toLocaleString("es-ES")`.
- Todo acceso a `localStorage` y `location` va en `try/catch` y solo después del montaje en el cliente.

## Plan de implementación

Cada paso deja la app ejecutable y es commiteable por separado.

1. **Leer la guía de Next.** Revisar en `node_modules/next/dist/docs/01-app/` lo relativo a Client Components y `cacheComponents` antes de escribir código.
2. **Datos y tipos.** Crear `lib/types.ts` y `lib/data.ts` (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) portando `data.jsx` sin cambiar los valores.
3. **Shell cliente.** Crear `components/app-shell.tsx` (`"use client"`) con estado de ruta, usuario y handlers (`navigate`, `onLogin`, `onSignOut`, `onSaveScore`), más el footer. Reemplazar `app/page.tsx` por un Server Component que solo renderiza `<AppShell />`. Pantalla inicial: biblioteca.
4. **Hash y sesión sin hydration mismatch.** La ruta y el usuario se leen del hash y de `localStorage` en un `useEffect` tras el montaje. El primer render es siempre `biblioteca` y sin usuario. Cada cambio de ruta escribe el hash y hace scroll al inicio.
5. **Nav.** Crear `components/nav.tsx` con enlaces, contador de créditos, botón de sesión y panel móvil con backdrop.
6. **Biblioteca.** Crear `components/library.tsx` con `GameCard` (tilt con el mouse), buscador, chips y estado vacío.
7. **Detalle.** Crear `components/game-detail.tsx` con portada, tags, stats, botones y el leaderboard (`seededScores(id.length * 17 + 3, 10)`). Si el `id` no existe, vuelve a la biblioteca en lugar de renderizar nada.
8. **Auth.** Crear `components/auth.tsx` con tabs "iniciar sesión / crear cuenta", campo de correo solo en registro, "jugar como invitado" y botones sociales decorativos.
9. **Reproductor.** Crear `components/game-player.tsx` con HUD, arena CRT, pausa, FIN, salir y modal de fin de juego con guardado en `av_scores`.
10. **Salón de la fama.** Crear `components/hall-of-fame.tsx` con tabs por juego, podio, tabla y fila "TU MEJOR MARCA" si hay usuario.
11. **Limpieza.** Quitar los assets sin uso del scaffold (`public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) y actualizar `CLAUDE.md` con la estructura nueva.

## Criterios de aceptación

- [x] `npm run lint` y `npm run build` terminan sin errores.
- [x] Al abrir `/` se ve la biblioteca con 8 tarjetas, el hero "ARCADE VAULT" y el footer.
- [x] Escribir "gl" en el buscador deja solo la tarjeta GLOTÓN; un texto sin coincidencias muestra "NO HAY RESULTADOS".
- [x] El chip SHOOTER muestra exactamente INVASORES y ROCAS; TODOS vuelve a mostrar las 8.
- [x] Clic en una tarjeta o en su botón JUGAR abre el detalle del juego correcto y el hash cambia a `#%7B%22name%22...`.
- [x] Recargar la página con un hash de detalle abre ese mismo detalle.
- [x] El detalle muestra 10 filas de leaderboard con las 3 primeras destacadas; "VOLVER AL VAULT" regresa a la biblioteca.
- [x] "JUGAR AHORA" abre el reproductor; la puntuación sube sola cada ~220 ms.
- [x] PAUSA detiene la puntuación y muestra "EN PAUSA"; REANUDAR la reanuda.
- [x] FIN abre el modal con la puntuación final; "GUARDAR PUNTUACIÓN" agrega una entrada a `localStorage["av_scores"]` y muestra "PUNTUACIÓN GUARDADA\_".
- [x] "JUGAR DE NUEVO" reinicia puntuación, vidas y nivel; SALIR vuelve al detalle del mismo juego.
- [x] Iniciar sesión con usuario "kai" guarda `av_user = {"name":"KAI"}`, el `Nav` muestra "KAI ▾" y la app va a la biblioteca.
- [x] "JUGAR COMO INVITADO" va a la biblioteca sin usuario y el `Nav` muestra "Iniciar Sesión".
- [x] Clic en el botón de usuario del `Nav` cierra sesión y borra `av_user`.
- [x] El Salón muestra podio, tabla de 12 filas y tabs de los 8 juegos; con usuario logueado aparece la fila "TU MEJOR MARCA EN <JUEGO>", sin usuario no.
- [x] En ancho ≤ el breakpoint móvil de `globals.css` aparece el botón ≡ y el panel lateral navega a las pantallas.
- [x] La consola del navegador no muestra errores de hydration ni warnings de React.
- [x] No quedan referencias a `Image`/`next.svg` ni al contenido del scaffold en `app/page.tsx`.

## Decisiones

- **Sí:** navegación SPA con hash, como la plantilla. Decisión del usuario; mantiene fidelidad y velocidad.
- **No:** rutas reales del App Router (`/juegos/[id]`). Serían más correctas para URLs compartibles, pero se descartaron para este MVP; es candidata a su propia spec.
- **Sí:** portar el CSS casi tal cual (ya hecho en `globals.css`). Máxima fidelidad visual.
- **No:** reescribir con Tailwind v4 o CSS Modules. Más trabajo y riesgo de desviarse del diseño.
- **Sí:** sesión mock en `localStorage` con la clave `av_user`, igual que la plantilla. Hace que `Nav` y Salón se comporten como en el diseño.
- **No:** auth "solo visual" sin estado. Dejaría sin demostrar la variante logueada del `Nav` y del Salón.
- **Sí:** reproductor con simulación y modal de guardado. Valida el flujo completo de pantallas sin tener juegos.
- **No:** marco estático. No probaría el HUD, la pausa ni el flujo de guardar puntuación.
- **Sí:** un único Client Component raíz (`AppShell`) y `page.tsx` como Server Component mínimo. El estado de ruta y `localStorage` solo existen en el cliente.
- **Sí:** leer hash y `localStorage` tras el montaje. Evita hydration mismatch con el HTML del servidor.
- **No:** leer `av_scores` en la UI. Mostrar las marcas guardadas es parte del backend/ranking real.
- **Sí:** datos determinísticos con `seededScores`, sin `Math.random` en el render. Salvo la puntuación simulada del reproductor, que es intencionalmente aleatoria y vive en un timer.

## Riesgos

| Riesgo                                                          | Mitigación                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `cacheComponents` rompe el acceso a APIs dinámicas en el render | Todo el estado dinámico va en un Client Component y en efectos; `page.tsx` no usa APIs dinámicas. |
| Hydration mismatch por hash o `localStorage`                    | Primer render fijo (`biblioteca`, sin usuario); lectura real en `useEffect`.                      |
| Parpadeo de la biblioteca al abrir un hash de otra pantalla     | Aceptado en el MVP; se resolvería con rutas reales (spec futura).                                 |
| `localStorage` bloqueado (modo privado)                         | `try/catch` en cada acceso; la app funciona sin persistir.                                        |
| Next 16.4 con cambios respecto al conocimiento previo           | Paso 1 obliga a leer `node_modules/next/dist/docs/` antes de codificar.                           |
| Hash con JSON malformado o `id` inexistente                     | Ruta inválida cae a `biblioteca`; detalle/reproductor con `id` inválido redirigen a biblioteca.   |

## Lo que **no** está en esta spec

- Ningún juego real.
- Backend, base de datos o auth real (OAuth incluido).
- Rutas reales por pantalla.
- Mostrar puntuaciones guardadas del usuario.
- Tests automatizados.
- Tema claro.

Cada uno, si llega, va en su propia spec.
