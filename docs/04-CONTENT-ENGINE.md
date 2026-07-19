# 04-CONTENT-ENGINE.md

## Acostel OS — Content Engine

> **Versión:** 1.0 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza cuando un canal nuevo se conecta, o cuando la redacción deja de ser 100% manual.

---

## Rol dentro del sistema

El Content Engine es el módulo ya definido en `docs/01-CORE-PLATFORM.md` (módulo 3): produce el texto redactado de cada ficha, distinto por canal.

**Relación con Data Engine — sin ambigüedad:** Data Engine y Content Engine **no se alimentan entre sí**. Ambos operan sobre el mismo origen (Notion), con responsabilidades distintas:

- **Data Engine** → datos estructurados (precio, ubicación, specs).
- **Content Engine** → contenido textual por canal.

El único punto de contacto entre ambos es que Data Engine, al armar la salida del sitio, **lee directamente** el campo Web/SEO de la base "Copies por Canal" en Notion — igual que lee la base de Propiedades o Vehículos. No es una entrega de Content Engine hacia Data Engine; es una lectura compartida de la misma fuente. El detalle de esa lectura (paso 6, "Emparejar con Content Engine") vive en `docs/03-DATA-ENGINE.md` y no se repite aquí.

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Content Engine |
|---|---|
| Notion (Data Source) | Origen. La base "📣 Copies por Canal" es donde vive este módulo — es una parte de Notion, no un sistema aparte. |
| Data Engine | Mismo origen, responsabilidad distinta (ver arriba). Ninguno depende del otro para funcionar. |
| Creative Engine | Sin conexión hoy. Cada uno redacta o produce su parte por separado — no hay un punto del sistema donde texto e imagen se junten todavía (eso ocurre a mano, fuera del repositorio, en Distribution). |
| Web Interface (Site) | Conexión indirecta. El sitio nunca lee Content Engine directamente — recibe el texto ya incorporado en la salida de Data Engine. |
| Distribution | Los cinco canales que no son Web/SEO (WhatsApp, Instagram, TikTok, Facebook, Marketplace) ya tienen texto redactado en Notion, pero Distribution los publica manualmente, sin ninguna conexión automática a este sistema. |

---

## Estructura de contenido (qué produce)

La estructura de campos es la misma para las seis filas de canal de la base "Copies por Canal" (Canal, Copy, Estado, relación con Propiedad/Vehículo, Contenido de la página) — ya documentada campo por campo en `docs/02-DATA-SCHEMA.md`. No se repite aquí.

Lo que cambia entre canales es el contenido redactado dentro de cada fila, adaptado al tono y formato de cada uno (un texto para Web/SEO no se escribe igual que un texto para Instagram). Hoy, **solo la fila Web/SEO tiene clasificación pública** — porque es la única que llega al sitio. Las otras cinco no se han evaluado bajo la frontera público/interno de `docs/00-VISION.md` porque nada las consume todavía; evaluarlas es parte de conectar Distribution al sistema, no una tarea pendiente de este documento.

---

## Proceso de generación (cómo se produce)

Distinto de la estructura de arriba: esta sección es sobre **cómo** se llega a ese contenido, no sobre qué forma tiene.

Hoy es **100% autoría humana**, escrita directamente en Notion por el cliente. No existe generación asistida por IA en la redacción — los copies ya vienen escritos cuando Data Engine los lee; Claude Code no redacta contenido original de fichas, solo lo transforma y limpia en el paso de sincronización (`docs/03-DATA-ENGINE.md`).

El campo Estado (Borrador / Aprobado / Publicado) controla qué copy está listo para usarse — regla ya definida en `docs/02-DATA-SCHEMA.md` ("solo se importan copies en Aprobado"), no se repite aquí.

---

## Qué existe hoy vs. qué es parcial o futuro

- **Existe:** la base de Notion con las seis filas de canal por ficha; la redacción manual del canal Web/SEO, ya en uso real en el sitio.
- **Parcial:** los otros cinco canales — tienen contenido redactado, pero sin ningún consumidor conectado dentro de este sistema.
- **Futuro:** generación asistida de copies para los canales que no son Web/SEO a partir del mismo dato base, en vez de redactar cada uno por separado (ya señalado en `docs/01-CORE-PLATFORM.md`, no se repite aquí).

---

## Manual hoy vs. qué haría falta para escalar

- **Falta generación asistida real** — hoy cada canal se redacta a mano; no hay ningún proceso que genere un borrador a partir del dato estructurado.
- **Falta conexión real entre Content Engine y Distribution** — los cinco canales no-Web/SEO existen pero se publican por fuera de este sistema, sin registro de cuándo ni si se usaron.
- **El mensaje de WhatsApp está duplicado sin saberlo** — el texto que ofrece el botón de WhatsApp del sitio está escrito directamente en `js/common.js`, no se toma del canal "WhatsApp" de Content Engine en Notion. Son dos textos que hoy pueden decir cosas distintas y nada los mantiene sincronizados.

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Content Engine como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega.
- `docs/02-DATA-SCHEMA.md` — la estructura de campos exacta de la base "Copies por Canal". No se repite ningún campo aquí.
- `docs/03-DATA-ENGINE.md` — dónde y cómo se lee el canal Web/SEO al armar la salida del sitio. Este documento no repite ese flujo.
- `docs/00-VISION.md` — el principio de frontera público/interno que aplica (parcialmente todavía) a este módulo.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define el Content Engine como módulo de producción de texto por canal: su rol frente a Data Engine (mismo origen, sin relación de entrega entre ambos), estructura de contenido vs. proceso de generación como preguntas separadas, qué existe vs. qué es parcial o futuro, relación con Creative Engine/Web Interface/Distribution, y el detalle técnico de qué faltaría para escalarlo (incluida la duplicación no sincronizada del mensaje de WhatsApp). Documento validado como base oficial del proyecto. |
