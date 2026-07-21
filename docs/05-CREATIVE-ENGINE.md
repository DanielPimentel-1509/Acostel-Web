# 05-CREATIVE-ENGINE.md

## Acostel OS — Creative Engine

> **Versión:** 1.0 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza cuando exista un Brand Template real en Canva, o cuando se defina el pipeline Canva → repositorio.

---

## Rol dentro del sistema

El Creative Engine es el módulo ya definido en `docs/01-CORE-PLATFORM.md` (módulo 4): produce el material visual de cada ficha.

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Creative Engine |
|---|---|
| Notion (Data Source) | Solo guarda fotos crudas como adjuntos (campo Foto/Fotos, ver `docs/02-DATA-SCHEMA.md`). Sin relación con lo que se produce en Canva — son dos materiales visuales distintos que no se cruzan hoy. |
| Content Engine | Sin conexión hoy. Cada uno se produce por separado: texto en Notion, visual en Canva. Ninguno alimenta al otro (mismo principio ya aplicado entre Data Engine y Content Engine en `docs/04-CONTENT-ENGINE.md`). |
| Canva | Dónde vive realmente este módulo hoy — ver detalle abajo. |
| Web Interface (Site) | Sin conexión. Ningún creativo de Canva llega hoy al sitio; las fichas usan imágenes de marcador mientras tanto. |
| Distribution | Es el consumidor real de estos creativos hoy: se descargan de Canva y se publican manualmente en redes sociales. |

---

## Qué hace hoy realmente

Verificado directamente en Canva (no asumido):

- Existe un **brand kit "ACOSTEL"** configurado, con la identidad de marca (colores, fuentes) disponible para cualquier diseño nuevo.
- Existe una **plantilla base real**: "Plantilla Acostel - Diseños" (2 páginas), con dos campos genéricos reemplazables ("Ubicación", "Título") y elementos fijos de marca (nombre del negocio, número de WhatsApp).
- Ya existen **más de 15 diseños derivados de esa plantilla**, uno por ficha (ejemplo verificado: "Casa Andy", donde "Ubicación" → "Lourdes Colón" y "Título" → "CASA NUEVA A ESTRENAR"), cada uno con más páginas que la plantilla base según el contenido propio de esa propiedad.
- **No existe ningún Brand Template formal de Canva** (la función de autofill de Canva para generar variaciones automáticamente) — se confirmó buscando específicamente uno para Acostel y no apareció ninguno.

Esto es una corrección de estado frente a lo que decía `docs/01-CORE-PLATFORM.md` hasta ahora ("el cliente está por empezar a producir creativos diseñados"): la producción en Canva ya es una práctica establecida, no algo que recién comienza. Se corrige en ese documento (ver Registro de cambios).

---

## Plantillas, variaciones y proceso de generación

Tres preguntas distintas, para no mezclarlas:

**Plantilla** — el diseño base en Canva. Tiene campos genéricos pensados para reemplazarse (hoy: "Ubicación", "Título") y elementos fijos que no cambian entre fichas (nombre del negocio, número de WhatsApp). Hoy existe una sola plantilla base confirmada para propiedades ("Plantilla Acostel - Diseños").

**Variación** — un diseño derivado de la plantilla para una ficha específica. Se crea duplicando la plantilla y reemplazando sus campos genéricos con el dato real de esa propiedad o vehículo, y agregando las páginas adicionales que haga falta (más fotos, más piezas) según el contenido disponible.

**Proceso de generación** — cómo se llega de la plantilla a la variación. Hoy es **100% manual dentro de Canva**: alguien duplica el diseño base, escribe a mano el texto de cada campo, y agrega o ajusta imágenes página por página. No hay ningún paso automatizado — ni siquiera el autofill que Canva ya ofrece para este tipo de caso, porque no hay un Brand Template configurado.

---

## Qué existe hoy vs. qué es parcial o futuro

- **Existe:** brand kit, plantilla base para propiedades, más de 15 variaciones ya creadas, y publicación manual de esas variaciones en redes (Distribution).
- **Parcial:** las fotos crudas que sí existen en Notion no se usan hoy ni en Canva ni en el sitio — viven aisladas como adjuntos.
- **Futuro:** un pipeline que lleve estos creativos (o versiones exportadas de ellos) desde Canva hasta el repositorio del sitio, para que dejen de ser exclusivos de redes sociales y también alimenten las fichas del sitio.

---

## Qué tan manual es el proceso hoy

Completamente manual, en todos sus pasos: crear la variación, llenar los campos, exportar el diseño y entregarlo a Distribution. No hay ninguna automatización hoy — ni de Canva hacia el sitio, ni de Notion hacia Canva, ni del llenado de campos dentro de Canva mismo.

---

## Qué se necesitaría para escalarlo

- **Convertir la plantilla actual en un Brand Template real de Canva** (con campos definidos como dataset) para poder generar variaciones con autofill en vez de duplicar y editar cada una a mano — la plantilla base ya existe, falta formalizarla como tal.
- **Definir un pipeline de fotos** — hoy las fotos crudas de Notion no llegan ni a Canva ni al sitio; falta decidir en qué punto del proceso se usarían.
- **Definir el pipeline Canva → repositorio del sitio** — dónde se exportan, con qué nombre, y cómo se conectan a cada ficha en `images/listings/` (ya señalado como pendiente en `docs/01-CORE-PLATFORM.md`, no se repite aquí el detalle).

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Creative Engine como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega con el estado real verificado en Canva.
- `docs/02-DATA-SCHEMA.md` — clasificación del campo Foto/Fotos en Notion (fotos crudas, distintas de los creativos de Canva).
- `docs/04-CONTENT-ENGINE.md` — mismo principio de "sin conexión hoy" aplicado entre ambos módulos productores de contenido.
- `docs/00-VISION.md` — el riesgo abierto de este módulo ya está registrado ahí, actualizado en esta misma revisión para reflejar el estado real.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define el Creative Engine con el estado real verificado directamente en Canva: brand kit configurado, plantilla base real con campos genéricos, más de 15 variaciones ya producidas, y ausencia de un Brand Template formal (autofill). Distingue plantilla, variación y proceso de generación como tres preguntas separadas. Corrige la descripción de este módulo en `docs/01-CORE-PLATFORM.md` y el riesgo correspondiente en `docs/00-VISION.md`, que subestimaban cuánto de este módulo ya existe. Documento validado como base oficial del proyecto. |
