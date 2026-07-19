# 02-DATA-SCHEMA.md

## Acostel OS — Contrato de datos: Notion ↔ Sitio

> **Versión:** 1.0 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza cada vez que un campo de Notion se agrega, se renombra, o cambia su clasificación.

---

## Propósito de este documento

Referencia técnica exacta de qué campos existen hoy en cada base de Notion, si son públicos o internos, y a qué se mapean en el sitio. Es el documento que debe consultar quien ejecute **Data Processing/Sync** o **Content Engine** (módulos definidos en `docs/01-CORE-PLATFORM.md`) — hoy Claude Code, a futuro un proceso automatizado.

No repite la filosofía de "frontera público/interno" (ya está en `docs/00-VISION.md` → Modelo de datos). Aquí se aplica esa regla campo por campo, con nombres reales.

---

## Base "🏠 Propiedades"

| Campo en Notion | Clasificación | Mapea a (sitio) | Nota |
|---|---|---|---|
| Propiedad (título) | Público | — | Hoy no se usa directo; el título del sitio sale del Content Engine (ver abajo) cuando existe copy Web/SEO. |
| Tipo | Público | — (uso interno al clasificar) | Casa, Terreno, Lote, Mesón, Rancho, Apartamento. |
| Ubicación | Público | `location` | Zona/ciudad general — nunca la dirección exacta. |
| Dirección | **Interno** | — | Dirección exacta. No se publica (decisión de privacidad, ver `00-VISION.md`). |
| Precio venta | Público | `price` | |
| Precio alquiler | Público | `price` (cuando aplica) | Define `operacion: Renta`. |
| Precio FInal | **Interno** | — | Precio mínimo/negociado. Nunca público — sirve de piso de negociación interno. *(El nombre del campo tiene un typo en Notion: "FInal", no "Final".)* |
| Comisión $ | **Interno** | — | Nunca público. |
| Contacto / Propietario | **Interno** | — | Nunca público. |
| Fuente | **Interno** | — | Quién trajo el anuncio. Nunca público. |
| Habitaciones / Baños / Estacionamientos | Público | `specs.*` | |
| Medida (m² / v²) | Público | `specs.areaTerreno` | |
| Medidas (Frente x Fondo) | Público | — | No se usa hoy en el sitio; disponible si se necesita. |
| m² construcción | Público | `specs.areaConstruccion` | Casi siempre vacío en los datos actuales. |
| Info de WhatsApp Business | Legado | — | Texto de respaldo, anterior al Content Engine. Hoy **no se usa** cuando existe un copy Web/SEO en "Copies por Canal" — ese tiene prioridad. |
| Notas | **Interno** | — | Notas internas del equipo. Nunca público. |
| Prioridad de venta | Interno, con efecto público | `badge` | El valor no se muestra, pero si es "Alta" se muestra el badge "Destacada". |
| Revisión | **Interno** | — | Control de flujo (Por revisar / Lista para publicar / Descartada). Ver regla de importación más abajo. |
| Estado | Interno, con efecto público | — | Disponible / Vendida / etc. Ver regla de importación más abajo. |
| Foto | Creative Engine | — | Adjuntos de Notion, no enlazables directo. Ver `01-CORE-PLATFORM.md` → Creative Engine. |
| Plano | No usado | — | |
| Link ubicación (Maps) | **Interno** (por ahora) | — | Podría exponer la ubicación exacta; no se usa hasta decidir lo contrario. |
| Link publicación | **Interno** | — | Referencia a otro canal (ej. Marketplace), no relevante para el sitio. |
| Código / ID | **Interno** | Genera el `id` de la ficha (ej. `prop-copa-2`) | No se muestra tal cual, pero sí aparece como "Referencia: prop-copa-2" en la ficha. |

---

## Base "🚗 Vehículos"

| Campo en Notion | Clasificación | Mapea a (sitio) | Nota |
|---|---|---|---|
| Vehículo (título) | Público | — | No se usa directo — el título del sitio se arma como `Marca + Modelo + Año`, más limpio que el título libre de Notion. |
| Marca / Modelo / Año | Público | `title`, `specs.anio` | |
| Kilometraje | Público | `specs.kilometraje` | |
| Precio | Público | `price` | |
| Prima | Público | `features` (como "Financiamiento disponible") | A diferencia de Comisión, el valor de la prima sí se muestra — es información útil para el comprador. |
| Comisión $ | **Interno** | — | Nunca público. |
| Fuente | **Interno** | — | Nunca público. |
| Notas | **Interno** | — | Nunca público. |
| Prioridad de venta | Interno, con efecto público | `badge` | Igual que en Propiedades. |
| Revisión | **Interno** | — | Igual que en Propiedades. |
| Info de WhatsApp Business | Legado | — | Igual que en Propiedades: reemplazado por el copy Web/SEO cuando existe. |
| Link publicación | **Interno** | — | |
| Fotos | Creative Engine | — | |
| N#, N# 1, N# 2, Número | Sin uso claro | — | No se usan en el sitio. Candidatos a limpiar en Notion si nadie recuerda para qué eran. |

No hay campos de Transmisión, Combustible o Motor en Notion hoy — el sitio los deja en blanco ("—") cuando no hay dato, no se inventan.

---

## Base "📣 Copies por Canal" (Content Engine)

| Campo en Notion | Clasificación | Nota |
|---|---|---|
| Canal | **Interno** | Metadato de organización (Web/SEO, WhatsApp, Instagram, TikTok, Facebook, Marketplace). Hoy el sitio solo consume el canal **Web/SEO**. |
| Copy (título de la entrada) | **Interno** | Nombre interno de la ficha de copy (ej. "Casa José — Web / SEO"), no es el contenido en sí. |
| Estado | **Interno** | Borrador / Aprobado / Publicado. **Regla:** solo se deben usar copies en estado "Aprobado" al sincronizar. |
| Propiedad / Vehículo (relación) | **Interno** | Vincula el copy con su ficha. |
| Contenido de la página (cuerpo) | Público, tras limpieza | Título (H1), párrafo introductorio, lista de características, y notas de precio/ubicación son públicos. Se descartan siempre: bloques que mencionen comisión o porcentajes de comisión, líneas de contacto/teléfono, y frases de cierre tipo "agenda tu visita" (son redundantes con el botón de WhatsApp del sitio). |

---

## Reglas de importación (para la próxima vez que se sincronice)

1. Tomar solo fichas con **Estado = Disponible** (Propiedades) — no importar Vendida/Alquilada/etc.
2. Tomar solo copies con **Estado = Aprobado** en Copies por Canal.
3. Si no existe un copy Web/SEO aprobado para una ficha, usar "Info de WhatsApp Business" como respaldo (limpio de líneas de contacto), nunca dejar la ficha sin descripción.
4. Nunca copiar al sitio ningún campo marcado como **Interno** en las tablas de arriba, bajo ninguna circunstancia.
5. El estado "Revisión" no se usa hoy de forma consistente (ya registrado en `docs/00-VISION.md` → Riesgos abiertos) — no bloquear la importación por su valor todavía.

---

## Relación con la documentación

- `docs/00-VISION.md` — define el principio de frontera público/interno. Este documento lo aplica campo por campo.
- `docs/01-CORE-PLATFORM.md` — define los módulos Data Processing/Sync y Content Engine que usan este contrato. No se repite aquí qué es cada módulo.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Mapea campo por campo las bases Propiedades, Vehículos y Copies por Canal: clasificación público/interno, a qué campo del sitio mapea cada uno, y notas de casos reales encontrados (typo en "Precio FInal", campos sin uso claro en Vehículos, "Info de WhatsApp Business" como respaldo legado del Content Engine). Agrega reglas de importación explícitas para la próxima sincronización. Documento validado como base oficial del proyecto. |
