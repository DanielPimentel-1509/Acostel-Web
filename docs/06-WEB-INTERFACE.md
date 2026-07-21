# 06-WEB-INTERFACE.md

## Acostel OS — Web Interface

> **Versión:** 1.1 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza cuando el sitio pase de consumir un archivo estático a consumir datos en vivo, o cuando se conecte un módulo que hoy no lo está.

---

## Rol dentro del sistema

El Web Interface es el módulo ya definido en `docs/01-CORE-PLATFORM.md` (módulo 5): muestra catálogo, fichas, filtros y canal de contacto.

**Precisión importante:** Data Engine es la única entrada real **hacia el Web Interface** — no la única fuente de todo el sistema. Content Engine y Creative Engine existen y producen en sus propios entornos (Notion y Canva, respectivamente, ver `docs/04-CONTENT-ENGINE.md` y `docs/05-CREATIVE-ENGINE.md`), pero no están conectados directamente al sitio. Lo que el sitio "sabe" de contenido ya viene resuelto dentro de la salida de Data Engine (`js/data.js`) — el Web Interface nunca consulta Content Engine ni Creative Engine por sí mismo.

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Web Interface |
|---|---|
| Data Engine | Única entrada real hacia el sitio. Todo lo que se muestra viene de `js/data.js`. |
| Content Engine | Sin conexión directa. Su texto llega indirectamente, ya incorporado por Data Engine dentro de `js/data.js` — el sitio no sabe que Content Engine existe. |
| Creative Engine | Sin conexión. Produce en Canva, fuera de este sistema; el sitio usa imágenes de marcador mientras no exista un pipeline que entregue creativos reales. |
| Notion (Data Source) | Sin conexión directa. El sitio nunca consulta Notion — solo consume lo que Data Engine ya transformó. |
| Publishing | Quien lo despliega. Publishing toma el repositorio (ya actualizado por Data Engine) y lo lleva al sitio en vivo — no se repite ese proceso aquí. |
| Sales / Leads | El botón y los enlaces de WhatsApp, y el formulario de contacto, viven en el código del sitio (`js/common.js`, `index.html`), pero la gestión del contacto en sí (qué pasa después) es responsabilidad de ese otro módulo, no de este. |

---

## Qué existe hoy realmente

Un sitio **estático**, sin backend ni base de datos propia:

- `index.html` — página de inicio: catálogo con pestañas (propiedades/vehículos), filtros, y el formulario de contacto (sección `#contacto`).
- `ficha.html` — página de detalle de una propiedad o vehículo.
- `gracias.html` — página de confirmación tras enviar el formulario de contacto.
- `css/styles.css` — el sistema de diseño completo (paleta, tipografía, componentes).
- `js/data.js` — la salida de Data Engine: el arreglo `listings`, generado por lote.
- `js/common.js` — helpers compartidos entre ambas páginas (WhatsApp, formato de precio, detección de video, navegación).
- `js/main.js` — lógica exclusiva del catálogo (filtros, tarjetas, pestañas).
- `js/detail.js` — lógica exclusiva de la ficha (galería, specs, video).

No hay paso de compilación (build step): los archivos se sirven tal cual están en el repositorio.

---

## Cómo consume los datos

Todo ocurre **en el navegador del visitante**, no en un servidor:

1. `index.html` y `ficha.html` cargan `js/data.js` como cualquier script — esto pone el arreglo `listings` completo en memoria.
2. En el catálogo, `js/main.js` filtra y renderiza ese arreglo directamente en el navegador según los filtros que el visitante elija (tipo, precio, ubicación).
3. En la ficha, `ficha.html?id=<id>` lee el parámetro `id` de la URL (`URLSearchParams`) y `js/detail.js` busca ese `id` dentro del mismo arreglo `listings` ya cargado.

No existe ninguna llamada a un servidor (`fetch`, API, base de datos) en ningún punto — se verificó directamente en el código, no se asume. Todo el contenido que el sitio puede mostrar ya está presente en `js/data.js` desde el momento en que se publica.

---

## Qué está conectado y qué no

**Conectado:**
- Data Engine, vía `js/data.js` (único canal de entrada de contenido y datos).
- Publishing, que despliega cualquier cambio del repositorio automáticamente, y que además procesa el formulario de contacto vía Netlify Forms (detalle en `docs/08-SALES-LEADS.md`).
- WhatsApp, vía enlaces `wa.me` generados en el propio código del sitio.

**No conectado:**
- Notion — el sitio no lo consulta jamás directamente.
- Content Engine — no hay ninguna ruta desde el sitio hacia los canales que no son Web/SEO (Instagram, TikTok, etc.); ni falta que la haya, porque esos canales no son para el sitio.
- Creative Engine — ningún creativo de Canva llega hoy a `images/listings/`.
- Un CRM o Notion — las respuestas del formulario quedan en el panel de Netlify, no llegan a ningún otro lugar del sistema.

---

## Qué partes son manuales o parciales

- **Actualizar el contenido del sitio** requiere el ciclo manual completo de Data Engine (ya documentado en `docs/03-DATA-ENGINE.md`, no se repite aquí) — el sitio en sí no tiene forma de refrescarse solo.
- **Las imágenes son de marcador** en la mayoría de fichas, hasta que exista el pipeline de Creative Engine (`docs/05-CREATIVE-ENGINE.md`).
- **Los filtros son básicos y solo del lado del cliente** (tipo, precio, ubicación) — no hay búsqueda de texto libre, paginación, ni ordenamiento configurable.

---

## Qué haría falta para que funcione como sistema completo

- **Pipeline real de datos** — que `js/data.js` se genere y actualice solo, sin el ciclo manual de Data Engine (ya señalado como riesgo en `docs/00-VISION.md` y detallado en `docs/03-DATA-ENGINE.md`, no se repite aquí).
- **Pipeline real de imágenes** — que las fichas usen creativos reales de Creative Engine en vez de marcadores (ya detallado en `docs/05-CREATIVE-ENGINE.md`).
- **Conectar el formulario a Notion o a un CRM** — el formulario ya existe y captura datos estructurados, pero sus respuestas quedan aisladas en Netlify (detalle en `docs/08-SALES-LEADS.md`).

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Web Interface como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega.
- `docs/03-DATA-ENGINE.md` — el contrato exacto de `js/data.js` que este módulo consume. No se repite aquí ese contrato.
- `docs/04-CONTENT-ENGINE.md` y `docs/05-CREATIVE-ENGINE.md` — los módulos que producen contenido y creativos sin conexión directa al sitio. Este documento solo aclara esa falta de conexión desde la perspectiva del sitio.
- `docs/08-SALES-LEADS.md` — el formulario de contacto y qué pasa con sus respuestas después de enviarse. Este documento no repite ese detalle, solo indica dónde vive en el sitio.
- `docs/00-VISION.md` — el riesgo abierto de leads sin CRM y el MVP priorizado ya están registrados ahí.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define el Web Interface como sitio estático sin backend: inventario real de archivos, cómo consume `js/data.js` en el navegador (verificado en código: sin `fetch` ni backend, búsqueda de ficha por `id` de URL contra el arreglo en memoria), qué está conectado (Data Engine, Publishing, WhatsApp) y qué no (Notion, Content Engine, Creative Engine, almacenamiento de leads), y qué haría falta para ser un sistema completo. Aclara que Data Engine es la única entrada real hacia el sitio, no la única fuente del sistema en general. Documento validado como base oficial del proyecto. |
| 1.1 | 2026-07-19 | Se implementó el formulario de contacto y la página `gracias.html`. Se agregan al inventario de archivos, y se actualiza la conexión con Publishing (ahora también procesa el formulario vía Netlify Forms) y con Sales/Leads. El punto pendiente de "canal estructurado de leads" pasa de faltante a implementado — lo que falta ahora es conectarlo a Notion o a un CRM, detallado en `docs/08-SALES-LEADS.md`. |
