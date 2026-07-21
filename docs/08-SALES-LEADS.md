# 08-SALES-LEADS.md

## Acostel OS — Sales / Leads

> **Versión:** 1.1 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza cuando el formulario se conecte a Notion o a un CRM, o cuando se configure alguna notificación automática de mensajes recibidos.

---

## Rol dentro del sistema

Sales/Leads es el módulo ya definido en `docs/01-CORE-PLATFORM.md` (módulo 7): recibe al cliente potencial que llega desde el sitio.

**Precisión importante:** Sales/Leads sigue sin ser un "módulo de sistema" en el sentido completo — WhatsApp sigue siendo un **punto de salida puro hacia un canal externo**, sin ningún registro ni retroalimentación. El formulario de contacto (nuevo, ver abajo) cambia esto parcialmente: por primera vez existe un **registro real** de que un contacto ocurrió, con sus datos estructurados. Pero ese registro vive en el panel de Netlify Forms — fuera de Notion, fuera del repositorio, y sin ninguna notificación automática configurada todavía. Sigue sin existir un loop de datos hacia el resto del sistema (nada llega a Notion, nada se conecta a un CRM, no hay métrica accesible desde aquí sin entrar manualmente a revisar).

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Sales/Leads |
|---|---|
| Web Interface (Site) | Quien arma y muestra los enlaces de WhatsApp y el formulario de contacto — el origen de todo este módulo. |
| Content Engine | Tiene su propio canal "WhatsApp" redactado en Notion, sin relación con los mensajes reales que arma el sitio (mismo hallazgo ya señalado en `docs/04-CONTENT-ENGINE.md`: son dos textos separados, no sincronizados). |
| Publishing | Nueva conexión: el formulario usa Netlify Forms, la misma cuenta de Netlify que ya usa Publishing para el deploy (`docs/07-PUBLISHING.md`). Las respuestas del formulario se guardan ahí, no en este repositorio. |
| Data Engine, Creative Engine | Sin relación directa. Ninguno participa en este punto de contacto. |

---

## Cómo entran los leads hoy

Verificado directamente en el código: existen **cinco puntos de entrada** — cuatro hacia WhatsApp y uno de captura estructurada.

**Hacia WhatsApp** (`js/common.js`, `js/detail.js`), cada uno con un mensaje pre-llenado distinto:

1. **Botón flotante** (visible en todo el sitio) — mensaje genérico: *"Hola, vi su sitio web y me gustaría más información sobre sus propiedades y vehículos."*
2. **Sección de contacto y enlace del footer** — mismo mensaje genérico que el punto anterior.
3. **CTA de "vender"** — mensaje orientado a quien quiere vender, no comprar: *"Hola, tengo una propiedad/vehículo que me gustaría vender con Acostel. Les comparto los detalles:"*
4. **Ficha de detalle** — el único mensaje que es específico por ficha: incluye el título y la referencia exacta de la propiedad o vehículo (ej. *"Hola, estoy interesado/a en '[título]' (ref. [id]). ¿Me podrían dar más información?"*).

**Formulario de contacto** (`index.html#contacto`, procesado por Netlify Forms) — captura los datos estructurados ya definidos en `docs/00-VISION.md`: nombre, contacto (teléfono o correo), mensaje, y una referencia de ficha opcional. Cuando se llega desde una ficha de detalle (vía el enlace "o completa el formulario de contacto"), ese campo de referencia se llena solo con el título y el id de la ficha — el mismo patrón que ya usa el mensaje de WhatsApp de la ficha. Al enviarse, el visitante es redirigido a `gracias.html`.

---

## Qué ocurre después de que un usuario contacta

**Por WhatsApp:** el clic abre una conversación de WhatsApp Business, completamente fuera del sitio. A partir de ese momento, todo lo que ocurre —leer el mensaje, responder, coordinar una visita o cerrar una venta— es 100% manual y humano. Nada de eso se refleja de vuelta en Notion, en el repositorio, ni en ningún otro lugar documentado en este proyecto.

**Por el formulario:** el envío queda almacenado como respuesta en el panel de Netlify Forms, con sus campos ya separados (nombre, contacto, mensaje, referencia). **No hay ninguna notificación automática configurada** — nadie recibe un correo ni un aviso cuando llega un mensaje nuevo; alguien tendría que entrar al panel de Netlify a revisar si hay respuestas pendientes. Esto es equivalente al hallazgo ya señalado en `docs/07-PUBLISHING.md` sobre la configuración de Netlify: vive fuera del repositorio y requiere configurarse a mano, una sola vez, directamente en el panel.

---

## Qué está conectado y qué no

**Conectado:** Web Interface arma los cuatro enlaces de WhatsApp y el formulario, y los muestra al visitante. El formulario, a su vez, entrega sus respuestas a Netlify Forms — la misma cuenta de Netlify que ya usa Publishing.

**No conectado:**
- No hay CRM.
- Las respuestas del formulario no llegan a Notion — quedan solo en el panel de Netlify.
- No hay notificación automática de mensajes nuevos (ni por correo, ni de ningún tipo) — hay que revisar el panel manualmente.
- No hay vínculo entre un contacto por WhatsApp y ningún registro — ahí no cambió nada.
- El canal "WhatsApp" de Content Engine (redactado en Notion) sigue sin relación con los mensajes reales del sitio.

---

## Qué partes son manuales

Todo lo que ocurre después de un contacto por WhatsApp es manual: la respuesta, el seguimiento, la coordinación, el cierre. Revisar si llegaron respuestas nuevas del formulario también es manual, porque no hay notificación configurada. También es manual mantener consistentes los mensajes pre-llenados del código — si el tono o la información cambia, alguien tiene que editarlos uno por uno en `js/common.js` y `js/detail.js`.

---

## Qué falta para convertirlo en un sistema real de gestión de leads

- **Notificación automática de mensajes nuevos** — hoy nadie se entera de una respuesta del formulario sin entrar al panel de Netlify a revisar.
- **Un vínculo real hacia Notion** — para que un lead capturado por el formulario aparezca donde ya vive el resto de la información del negocio, en vez de quedar aislado en Netlify.
- **Un vínculo real entre el lead y la ficha de origen**, para poder medir qué propiedades o vehículos generan más interés (hoy el campo de referencia es texto libre, no un vínculo real con el registro de Notion).
- **Integración con un CRM**, ya definida como "podría tener" en el MVP — el paso final de este módulo, no el primero.

El formulario resuelve el vacío más básico (que existiera algún registro estructurado), pero Sales/Leads sigue sin loop hacia el resto del sistema: el dato queda capturado, no conectado.

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Sales/Leads como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega.
- `docs/06-WEB-INTERFACE.md` — de dónde salen exactamente estos enlaces (el sitio los genera, no los recibe).
- `docs/04-CONTENT-ENGINE.md` — el hallazgo de los dos mensajes de WhatsApp separados (el del código vs. el canal de Content Engine en Notion).
- `docs/07-PUBLISHING.md` — la cuenta de Netlify que ahora también almacena las respuestas del formulario, y el mismo patrón de configuración fuera del repositorio.
- `docs/00-VISION.md` — el MVP priorizado (formulario, CRM) ya está definido ahí; el formulario pasa de pendiente a implementado.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define Sales/Leads como un punto de salida hacia un canal externo (WhatsApp), sin retroalimentación ni loop de datos dentro del sistema — no un módulo completo todavía. Documenta los cuatro puntos de entrada reales verificados en el código (`js/common.js`, `js/detail.js`), qué ocurre después del contacto (100% manual y externo), y qué haría falta para que sea un sistema real de gestión de leads. Documento validado como base oficial del proyecto. |
| 1.1 | 2026-07-19 | Se implementó el formulario de contacto (`index.html#contacto`, vía Netlify Forms, con redirección a `gracias.html` nuevo). Se agrega como quinto punto de entrada, con captura estructurada real (nombre, contacto, mensaje, referencia). Se aclara que esto resuelve el vacío más básico señalado en v1.0, pero no crea un loop hacia Notion o un CRM: las respuestas quedan en el panel de Netlify, sin notificación automática configurada — se agrega esa dependencia con `docs/07-PUBLISHING.md` (misma cuenta de Netlify). |
