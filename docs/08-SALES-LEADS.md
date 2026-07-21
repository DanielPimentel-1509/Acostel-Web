# 08-SALES-LEADS.md

## Acostel OS — Sales / Leads

> **Versión:** 1.0 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza cuando exista un formulario con captura estructurada, o cualquier registro de contacto dentro del sistema.

---

## Rol dentro del sistema

Sales/Leads es el módulo ya definido en `docs/01-CORE-PLATFORM.md` (módulo 7): recibe al cliente potencial que llega desde el sitio.

**Precisión importante:** Sales/Leads no es un "módulo de sistema" en el sentido completo todavía — hoy es un **punto de salida hacia un canal externo (WhatsApp)**, sin retroalimentación hacia el sistema. Un clic abre una conversación fuera del sitio y ahí termina la visibilidad de este sistema sobre lo que pasó. **No existe ningún loop de datos:** nada registra que el contacto ocurrió, nada le da seguimiento dentro del sistema, y no hay ninguna métrica medible desde aquí (cuántos clics, qué ficha generó más contactos, qué pasó después). Todo eso vive, si acaso, solo dentro de WhatsApp Business — fuera del alcance de este sistema.

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Sales/Leads |
|---|---|
| Web Interface (Site) | Quien arma y muestra los enlaces de WhatsApp — el único origen de estos clics. |
| Content Engine | Tiene su propio canal "WhatsApp" redactado en Notion, sin relación con los mensajes reales que arma el sitio (mismo hallazgo ya señalado en `docs/04-CONTENT-ENGINE.md`: son dos textos separados, no sincronizados). |
| Data Engine, Creative Engine, Publishing | Sin relación directa. Ninguno participa en este punto de contacto. |

---

## Cómo entran los leads hoy

Verificado directamente en `js/common.js` y `js/detail.js`: existen **cuatro puntos de entrada**, todos hacia WhatsApp, cada uno con un mensaje pre-llenado distinto:

1. **Botón flotante** (visible en todo el sitio) — mensaje genérico: *"Hola, vi su sitio web y me gustaría más información sobre sus propiedades y vehículos."*
2. **Sección de contacto y enlace del footer** — mismo mensaje genérico que el punto anterior.
3. **CTA de "vender"** — mensaje orientado a quien quiere vender, no comprar: *"Hola, tengo una propiedad/vehículo que me gustaría vender con Acostel. Les comparto los detalles:"*
4. **Ficha de detalle** — el único mensaje que es específico por ficha: incluye el título y la referencia exacta de la propiedad o vehículo (ej. *"Hola, estoy interesado/a en '[título]' (ref. [id]). ¿Me podrían dar más información?"*).

No existe ningún formulario de contacto implementado hoy — solo estos cuatro enlaces `wa.me`.

---

## Qué ocurre después de que un usuario contacta

El clic abre una conversación de WhatsApp Business, completamente fuera del sitio. A partir de ese momento, todo lo que ocurre —leer el mensaje, responder, coordinar una visita o cerrar una venta— es 100% manual y humano, y ocurre en una herramienta externa a este sistema. Nada de eso se refleja de vuelta en Notion, en el repositorio, ni en ningún otro lugar documentado en este proyecto.

---

## Qué está conectado y qué no

**Conectado:** Web Interface arma los cuatro enlaces con el mensaje correspondiente y los muestra al visitante.

**No conectado:**
- No hay CRM.
- No hay base de datos ni registro de leads en ningún lugar del sistema.
- No hay vínculo entre un clic y ningún registro en Notion — ni siquiera la ficha de origen queda anotada en ningún lado, más allá del texto del mensaje mismo.
- El canal "WhatsApp" de Content Engine (redactado en Notion) no se usa aquí — es un texto aparte, sin relación con estos mensajes reales.

---

## Qué partes son manuales

Todo lo que ocurre después del clic es manual: la respuesta, el seguimiento, la coordinación, el cierre. También es manual mantener consistentes los cuatro mensajes pre-llenados del código — si el tono o la información cambia, alguien tiene que editarlos uno por uno en `js/common.js` y `js/detail.js`.

---

## Qué falta para convertirlo en un sistema real de gestión de leads

- **Un formulario de contacto con captura estructurada** (nombre, contacto, mensaje, referencia de la ficha) — ya definido como "debería tener" en el MVP de `docs/00-VISION.md`, no se repite aquí el detalle.
- **Algún lugar donde ese dato se guarde** — hoy no existe ningún registro; ni siquiera queda un rastro de qué ficha generó el contacto, más allá del texto libre del mensaje de WhatsApp.
- **Un vínculo real entre el lead y la ficha de origen**, para poder medir qué propiedades o vehículos generan más interés.
- **Integración con un CRM**, ya definida como "podría tener" en el MVP — el paso final de este módulo, no el primero.

Mientras no exista al menos el primer punto, Sales/Leads seguirá siendo una salida hacia un canal externo, no un módulo que participa del sistema.

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Sales/Leads como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega.
- `docs/06-WEB-INTERFACE.md` — de dónde salen exactamente estos enlaces (el sitio los genera, no los recibe).
- `docs/04-CONTENT-ENGINE.md` — el hallazgo de los dos mensajes de WhatsApp separados (el del código vs. el canal de Content Engine en Notion).
- `docs/00-VISION.md` — el MVP priorizado (formulario, CRM) y el riesgo abierto de leads sin registro estructurado ya están definidos ahí.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define Sales/Leads como un punto de salida hacia un canal externo (WhatsApp), sin retroalimentación ni loop de datos dentro del sistema — no un módulo completo todavía. Documenta los cuatro puntos de entrada reales verificados en el código (`js/common.js`, `js/detail.js`), qué ocurre después del contacto (100% manual y externo), y qué haría falta para que sea un sistema real de gestión de leads. Documento validado como base oficial del proyecto. |
