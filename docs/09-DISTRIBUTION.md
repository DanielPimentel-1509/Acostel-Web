# 09-DISTRIBUTION.md

## Acostel OS — Distribution

> **Versión:** 1.0 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza si se conecta algún canal por API, o si se resuelve la ambigüedad del canal WhatsApp.

---

## Rol dentro del sistema

Distribution es el módulo ya definido en `docs/01-CORE-PLATFORM.md` (módulo 8): publica el contenido y los creativos en canales externos.

**Precisión importante:** Distribution es **100% manual hoy y ocurre completamente fuera del sistema** — en apps móviles y en las plataformas mismas (Instagram, TikTok, Facebook, Marketplace), no en este repositorio ni en Notion. No existe ninguna trazabilidad ni registro de lo publicado dentro del sistema: nadie aquí sabe qué se publicó, cuándo, ni en qué canal, más allá de lo que cada plataforma muestre por su cuenta. Es, junto con Sales/Leads (`docs/08-SALES-LEADS.md`), uno de los dos puntos donde el sistema termina y el trabajo pasa por completo a manos humanas en herramientas externas.

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Distribution |
|---|---|
| Content Engine | Fuente de texto — los cuatro canales (Instagram, TikTok, Facebook, Marketplace) ya tienen copy redactado en Notion, listo para usarse. |
| Creative Engine | Fuente de visuales — las variaciones ya producidas en Canva son lo que se descarga y se publica. |
| Data Engine, Web Interface, Publishing, Sales/Leads | Sin relación directa. Distribution no toca el repositorio ni el sitio en ningún punto. |

---

## Canales

Definidos en `docs/01-CORE-PLATFORM.md`: **Instagram, TikTok, Facebook, Marketplace.**

**Ambigüedad sin resolver (queda documentada, no decidida aquí):** Content Engine también redacta un canal llamado "WhatsApp" en Notion (ver `docs/02-DATA-SCHEMA.md`), pero WhatsApp no está en la lista de canales de Distribution. Son dos cosas distintas que no deben confundirse:

- **WhatsApp como canal de Sales/Leads** — una conversación 1:1, iniciada por un visitante del sitio (ver `docs/08-SALES-LEADS.md`), sin nada que "publicar".
- **Content Engine con copy redactado para "WhatsApp"** — un texto reutilizable, pensado presuntamente para usarse dentro de esas conversaciones (ej. una respuesta tipo o un mensaje de seguimiento), pero no conectado hoy a los mensajes reales que arma el sitio (`js/common.js`, `js/detail.js`).

No hay una decisión tomada sobre si ese copy pertenece a Distribution, a Sales/Leads, o a ninguno de los dos formalmente. Se deja como pendiente explícito, no se resuelve en este documento.

---

## Canal, formato de contenido y proceso de publicación

Tres preguntas distintas, para no mezclarlas:

**Canal** — dónde se publica (Instagram, TikTok, Facebook, Marketplace). Ya definido arriba.

**Formato de contenido** — qué produce cada motor, sin depender del canal: texto (Content Engine, misma estructura de campo para los cuatro canales, ver `docs/02-DATA-SCHEMA.md`) y visual (Creative Engine, plantilla base + variaciones por ficha en Canva, ver `docs/05-CREATIVE-ENGINE.md`). No existe hoy un mapeo confirmado de qué página o pieza de Canva corresponde a qué canal o formato específico (ej. post de Instagram vs. story vs. ficha de Marketplace) — no se inventa ese detalle aquí porque no está verificado.

**Proceso de publicación** — cómo ocurre la publicación en sí: 100% manual, directamente en cada plataforma. No se documenta aquí el detalle exacto de la mecánica (qué dispositivo, qué aplicación, quién la ejecuta) porque no está verificado — es información que solo el cliente puede confirmar, y no se asume.

---

## Qué está conectado y qué no

**Conectado:** nada, en términos de sistema. Content Engine y Creative Engine ya dejan el contenido listo (texto y visual), pero no hay ningún puente automático entre ese contenido y las plataformas — alguien tiene que tomarlo y publicarlo a mano.

**No conectado:** ninguna plataforma tiene integración por API; no hay ninguna herramienta de programación de publicaciones; no hay registro de qué se publicó ni cuándo.

---

## Qué partes son manuales

Toda la publicación es manual. También es manual mantener el copy y el visual de cada canal actualizados si algo cambia en la ficha (precio, disponibilidad) — nada avisa que una publicación ya hecha quedó desactualizada.

---

## Qué falta para un sistema de distribución real

- **Conexión por API a cada plataforma**, o una herramienta de terceros que centralice la publicación (tipo Meta Business Suite u otra) — hoy no existe ninguna.
- **Un mapeo confirmado entre pieza de Canva y canal/formato específico** — para saber qué variación corresponde a qué publicación, en vez de decidirlo cada vez a mano.
- **Resolver la ambigüedad del canal WhatsApp** — decidir si ese copy pertenece a Distribution, a Sales/Leads, o a ninguno de los dos como módulo formal (queda documentada como decisión pendiente, no se resuelve aquí).
- **Algún registro de lo publicado** — hoy no hay trazabilidad de qué salió a cada canal ni cuándo.

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Distribution como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega.
- `docs/04-CONTENT-ENGINE.md` — el copy por canal que Distribution usa, incluida la ambigüedad del canal WhatsApp.
- `docs/05-CREATIVE-ENGINE.md` — los visuales que Distribution usa, ya producidos en Canva.
- `docs/08-SALES-LEADS.md` — el otro punto donde el sistema termina y el trabajo pasa a manos humanas; la conversación 1:1 de WhatsApp vive ahí, no en Distribution.
- `docs/00-VISION.md` — el riesgo abierto de Distribution 100% manual ya está registrado ahí.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define Distribution como 100% manual y completamente externo al sistema, sin trazabilidad de lo publicado. Documenta los cuatro canales reales (Instagram, TikTok, Facebook, Marketplace), separa canal / formato de contenido / proceso de publicación como preguntas distintas, y deja documentada —sin resolver— la ambigüedad del canal "WhatsApp" de Content Engine frente al WhatsApp de Sales/Leads. Cierra la documentación de los 8 módulos definidos en `docs/01-CORE-PLATFORM.md`. Documento validado como base oficial del proyecto. |
