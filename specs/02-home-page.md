# SPEC 02 — Home page de Arcade Vault

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-08
> **Objective:** Portar a Next.js la landing `Home` de `references/templates/home-about/` como nueva pantalla inicial de la app, con datos mock y sin tocar About/Contacto.

---

## Por qué esta spec existe

La spec 01 dejó la biblioteca como pantalla inicial. La plantilla `home-about/` agrega una landing (hero, beneficios, juegos destacados, estadísticas, actividad, precios y CTA final) y un `Nav` con "Inicio". Esta spec incorpora esa landing y deja a Home como punto de entrada.

El working tree ya tiene cambios sin commitear en `components/app-shell.tsx`: hashes legibles (`#/juego/<id>`, `#/jugar/<id>`, `#/acceso`, `#/salon`) con compatibilidad hacia el hash JSON viejo. Esta spec los adopta y los completa con la ruta `home`.

## Alcance

**Dentro:**

- Pantalla `Home` (`components/home.tsx`) con las 6 secciones de `home.jsx`: hero con siluetas flotantes, "¿POR QUÉ ARCADE VAULT?", "JUEGOS DISPONIBLES AHORA", estadísticas, "ACTIVIDAD EN VIVO", "PRECIOS" (con FAQ) y CTA final.
- Animación de entrada `reveal` con `IntersectionObserver`, desactivada con `prefers-reduced-motion`.
- Nueva ruta `{ name: "home" }`, que pasa a ser la pantalla inicial y el destino de cualquier hash inválido.
- `Nav` actualizado: enlace "Inicio" (también en el panel móvil) y logo que lleva a Home.
- Hashes legibles adoptados como convención oficial: `#/` (home), `#/biblioteca`, `#/juego/<id>`, `#/jugar/<id>`, `#/acceso`, `#/salon`. Se mantiene la lectura de hashes JSON antiguos.
- Estilos de Home en un archivo propio, `app/home.css`, importado desde `app/layout.tsx`.
- Datos mock tipados de Home (beneficios, estadísticas, actividad reciente, top del día, lista de precios, FAQ).
- Actualizar `CLAUDE.md` con la nueva estructura.

**Fuera de alcance (specs futuras):**

- Pantalla About y formulario de Contacto (`about.jsx`). El `Nav` no muestra "Acerca de" hasta que exista esa spec.
- Datos reales para "Actividad en vivo" y "Top jugadores" (backend, tiempo real, lectura de `av_scores`).
- Variantes de Home según sesión (por ejemplo ocultar "CREAR CUENTA" con usuario logueado).
- Rutas reales del App Router.
- Variantes de tema de la plantilla (`Theme variants`) y cualquier modo claro.
- Tests automatizados.

## Modelo de datos

```ts
// lib/types.ts
export type Route =
  | { name: "home" } // nueva
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };

export interface HomeFeature {
  icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";
  title: string;
  desc: string;
  color: GameColor;
}
export interface HomeStat {
  n: string; // "12+", "MILES", "GLOBAL"
  unit: string;
  sub: string;
}
export interface RecentScore {
  player: string;
  game: string;
  score: number;
  ago: string; // "hace 2 min"
  color: GameColor;
}
export interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}
export interface FaqItem {
  q: string;
  a: string;
}
```

`lib/data.ts` exporta, con los valores de `home.jsx` sin cambios: `HOME_FEATURES` (4), `HOME_STATS` (3), `RECENT_SCORES` (7), `TOP_TODAY` (5), `PRICE_PERKS` (6 strings) y `HOME_FAQ` (3). Los juegos destacados salen de `GAMES.slice(0, 6)`.

Convenciones:

- Hash de ruta: ver la lista en Alcance. `biblioteca` deja de ser el valor por defecto de `routeToHash` y pasa a `#/biblioteca`.
- Hash vacío, `#/` o inválido → `{ name: "home" }`. `juego/` o `jugar/` sin `id` → Home.
- Los números se formatean con `toLocaleString("es-ES")`.
- No hay persistencia nueva. `av_user` y `av_scores` no cambian.

## Plan de implementación

Cada paso deja la app ejecutable y es commiteable por separado.

1. **Leer la guía de Next.** Revisar en `node_modules/next/dist/docs/01-app/` lo relativo a Client Components y `cacheComponents` antes de escribir código.
2. **Asentar los hashes.** Revisar los cambios sin commitear de `components/app-shell.tsx` y commitearlos tal cual (hashes legibles + compatibilidad JSON). Manual: abrir `/#/salon` y `/#/juego/caida` recarga la pantalla correcta.
3. **Ruta `home`.** Agregar `{ name: "home" }` a `Route` en `lib/types.ts`. En `app-shell.tsx`: renombrar la constante por defecto a `HOME`, mapear `home` ↔ `#/` y `biblioteca` ↔ `#/biblioteca`, y hacer que el estado inicial y los fallbacks sean `home`. Renderizar un placeholder de Home. Manual: `/` muestra el placeholder y `#/biblioteca` muestra la biblioteca.
4. **Tipos y datos.** Agregar los tipos de Home a `lib/types.ts` y las constantes a `lib/data.ts`.
5. **Estilos.** Crear `app/home.css` con las reglas de Home de `references/templates/home-about/styles.css`: bloque `HOME PAGE` (≈ líneas 930–1070, incluye `@keyframes float` y `.reveal`) y bloque de actividad y precios (≈ líneas 1620–1726). Omitir lo que `app/globals.css` ya define (`.btn.xl`, `.pulse`, `.blink`, `@keyframes fadeIn`). Importarlo en `app/layout.tsx` después de `globals.css`. Agregar una regla `prefers-reduced-motion` que muestra `.reveal` sin transición y detiene `.silo`.
6. **Hero.** Crear `components/home.tsx` (`"use client"`) con `Home`, `FloatingSilhouettes`, el hero y su hook `useReveal`. CTAs: "EXPLORAR JUEGOS" → biblioteca, "CREAR CUENTA" → auth.
7. **Beneficios y juegos.** Agregar `FeatureIcon`, la sección "¿POR QUÉ ARCADE VAULT?" y la sección de juegos con `MiniCard` (clic → detalle del juego) y el botón "VER TODOS LOS JUEGOS →".
8. **Estadísticas y actividad.** Agregar la franja de estadísticas y "ACTIVIDAD EN VIVO": ticker de últimas puntuaciones y lista de top jugadores con botón "VER SALÓN →" → salón.
9. **Precios y CTA final.** Agregar la tarjeta del plan único con FAQ y el CTA final "INSERTAR MONEDA →". "EMPEZAR GRATIS →" → auth.
10. **Nav.** En `components/nav.tsx`: agregar "Inicio" (barra y panel móvil), apuntar el logo a Home y ajustar `isActive` para `home`. Sin "Acerca de".
11. **Limpieza y documentación.** Reemplazar el placeholder del paso 3 por el `Home` real, actualizar `CLAUDE.md` (ruta inicial, hashes, `home.css`, componente nuevo) y marcar esta spec como `Implementado`.

## Criterios de aceptación

- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] Abrir `/` sin hash muestra Home y deja el hash en `#/`.
- [ ] Home muestra, en orden: hero "EL ARCADE CLÁSICO ESTÁ DE VUELTA", secciones `// 01`, `// 02`, franja de estadísticas, `// 03`, `// 04` y el CTA "¿LISTO PARA JUGAR?".
- [ ] El hero muestra 8 siluetas decorativas con `aria-hidden="true"`.
- [ ] La sección `// 01` muestra 4 tarjetas con los títulos JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS y SIEMPRE CRECIENDO.
- [ ] La sección `// 02` muestra exactamente 6 mini-tarjetas; clic en una abre el detalle de ese juego (`#/juego/<id>`).
- [ ] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" abren la biblioteca (`#/biblioteca`).
- [ ] "CREAR CUENTA" y "EMPEZAR GRATIS →" abren la pantalla de acceso (`#/acceso`).
- [ ] "VER SALÓN →" abre el salón (`#/salon`).
- [ ] El ticker muestra 7 filas y el top del día 5 filas; las 3 primeras del top llevan las clases `top1`, `top2` y `top3`.
- [ ] Los puntajes se muestran con separador de miles `es-ES` (por ejemplo `312.840`).
- [ ] Las secciones `.reveal` reciben la clase `in` al entrar en el viewport; con `prefers-reduced-motion: reduce` son visibles de inmediato.
- [ ] El `Nav` muestra Inicio, Biblioteca y Salón de la Fama (sin "Acerca de"); "Inicio" aparece activo en Home y "Biblioteca" en biblioteca, detalle y reproductor.
- [ ] Clic en el logo del `Nav` abre Home.
- [ ] Un hash inválido (`#/xyz`) o sin `id` (`#/juego/`) abre Home; `#/juego/no-existe` abre la biblioteca (regla de la spec 01).
- [ ] Un hash JSON antiguo (`#%7B%22name%22%3A%22salon%22%7D`) abre el salón.
- [ ] En el ancho móvil de `globals.css` el panel lateral incluye "Inicio" y navega a Home.
- [ ] Las pantallas de la spec 01 (biblioteca, detalle, reproductor, acceso, salón) se ven igual que antes de esta spec.
- [ ] La consola del navegador no muestra errores de hydration ni warnings de React al cargar `/`.

## Decisiones

- **Sí:** solo Home en esta spec. About y Contacto tienen formulario y estados propios; van en su propia spec.
- **No:** dejar un enlace "Acerca de" sin pantalla. Sería un enlace roto.
- **Sí:** Home como pantalla inicial y fallback de hashes inválidos. Es la intención de la plantilla (logo e "Inicio" van a Home).
- **No:** mantener la biblioteca como pantalla inicial. Home quedaría escondida detrás de un enlace.
- **Sí:** adoptar los hashes legibles ya escritos en `app-shell.tsx`. Las URLs son más claras y se conserva compatibilidad con el JSON.
- **No:** volver al hash JSON de la spec 01. Habría que descartar trabajo ya hecho sin ganar nada.
- **Sí:** estilos en `app/home.css` aparte. Aísla el cambio y evita regresiones en las pantallas existentes.
- **No:** reemplazar `globals.css` con el `styles.css` de la plantilla (1744 líneas). Riesgo de pisar las 5 pantallas de la spec 01.
- **Sí:** datos de actividad, top y FAQ como constantes tipadas en `lib/data.ts`, sin `Math.random`. Mantienen el render determinístico y sin hydration mismatch.
- **Sí:** respetar `prefers-reduced-motion` en `reveal` y siluetas. La plantilla no lo hace; es una mejora de accesibilidad barata. Decisión tomada sin consulta explícita al usuario.
- **Sí:** conservar el texto de la plantilla tal cual, incluido "12+ JUEGOS" aunque el catálogo mock tenga 8. Es copy de marketing, no un dato calculado.
- **Sí:** dejar "CREAR CUENTA" y "EMPEZAR GRATIS" visibles aunque haya sesión. Adaptarlos a la sesión se difiere a otra spec.

## Riesgos

| Riesgo                                                                            | Mitigación                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Parpadeo de Home al abrir un hash de otra pantalla (primer render fijo)           | Aceptado, igual que en la spec 01; se resolvería con rutas reales.                                            |
| Clases duplicadas o conflictivas entre `home.css` y `globals.css`                 | Paso 5 omite lo ya definido; criterio de aceptación exige que las pantallas de la spec 01 no cambien.         |
| `.reveal` deja secciones invisibles si el `IntersectionObserver` falla o no corre | `useReveal` corre en `useEffect`; con `prefers-reduced-motion` y sin soporte de observer se marcan como `in`. |
| Los criterios de la spec 01 ("al abrir `/` se ve la biblioteca") quedan obsoletos | La spec 01 se conserva como registro histórico; esta spec es la fuente vigente para la ruta inicial.          |
| Next 16.4 con cambios respecto al conocimiento previo                             | El paso 1 obliga a leer `node_modules/next/dist/docs/` antes de codificar.                                    |

## Lo que **no** está en esta spec

- Pantalla About y formulario de Contacto.
- Datos reales o en tiempo real para actividad y rankings.
- Home distinta según haya sesión o no.
- Rutas reales del App Router.
- Tests automatizados y tema claro.

Cada uno, si llega, va en su propia spec.
