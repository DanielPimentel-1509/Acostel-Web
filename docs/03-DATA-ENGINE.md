# 03-DATA-ENGINE.md

## Acostel OS — Data Engine

> **Versión:** 1.2 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza cada vez que un paso del flujo cambia (de manual a automatizado, o cuando se agrega/quita una fuente).

---

## Rol dentro del sistema

El Data Engine es el módulo que en `docs/01-CORE-PLATFORM.md` aparece como **Data Processing/Sync**. Este documento es su despliegue operativo completo: no un módulo nuevo, sino el mismo módulo visto en detalle.

**Diferencia con `docs/02-DATA-SCHEMA.md`:** Data Schema es el diccionario — qué campo existe, qué significa, si es público o interno. Data Engine es el proceso — cómo se mueve el dato usando ese diccionario. Uno sin el otro no alcanza: el esquema sin proceso es solo teoría; el proceso sin esquema no sabría qué es público.

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Data Engine |
|---|---|
| Notion (Data Source) | Entrada. Único origen de datos hoy. |
| Content Engine | Mismo origen (Notion), responsabilidad distinta — no hay entrega de un módulo a otro. Data Engine lee directamente el campo Web/SEO de la base Copies por Canal al armar la salida, igual que lee Propiedades o Vehículos. |
| Web Interface (Site) | Salida. Único consumidor del resultado de Data Engine hoy. |
| Creative Engine, Sales/Leads, Distribution, Publishing | Sin conexión con Data Engine hoy. Publishing actúa después, sobre el repositorio ya actualizado — no sobre la salida de Data Engine directamente. |

---

## Fuentes de datos hoy

Una sola fuente: **Notion**, vía las tres bases ya documentadas en `docs/02-DATA-SCHEMA.md` (Propiedades, Vehículos, Copies por Canal). No hay ninguna otra fuente conectada hoy — nada de hojas de cálculo, formularios externos, ni APIs de terceros.

---

## Flujo completo (paso a paso, como funciona hoy)

1. **Localizar las bases** — búsqueda en el workspace de Notion para encontrar las bases de Propiedades, Vehículos y Copies por Canal (hoy: bajo pedido explícito del cliente, no automático).
2. **Consultar los registros** — se leen todas las filas de Propiedades y Vehículos, y las filas de Copies por Canal filtradas por Canal = "Web/SEO".
3. **Filtrar** — se descartan registros que no cumplen las reglas de importación ya definidas en `docs/02-DATA-SCHEMA.md` (Estado ≠ Disponible, copies con Estado ≠ Aprobado).
4. **Aplicar la frontera público/interno** — por cada campo, se sigue la clasificación de `docs/02-DATA-SCHEMA.md`; los campos internos nunca pasan al siguiente paso.
5. **Transformar** (ver detalle abajo) — de datos crudos de Notion a la forma que espera el sitio.
6. **Emparejar con Content Engine** — cada registro se cruza con su copy de Web/SEO (por relación Propiedad/Vehículo) para tomar título y descripción ya redactados, cuando existen.
7. **Generar la salida** — se escribe `js/data.js` con el resultado completo.
8. **Verificar** — se revisa que no haya errores de sintaxis ni datos rotos (ej. "undefined", símbolos mal escapados) antes de continuar (principio ya definido en `CLAUDE.md`).
9. **Entregar** — se hace commit y push al repositorio. De ahí en adelante, el módulo Publishing toma el control; Data Engine termina su trabajo aquí.

---

## Transformaciones concretas

- **Precio:** si el registro tiene "Precio venta", se usa ese valor y `operacion: "Venta"`. Si solo tiene "Precio alquiler", se usa ese y `operacion: "Renta"`. "Precio FInal" nunca se usa (es interno).
- **ID de la ficha:** el "Código / ID" de Notion se pasa a minúsculas y se le quitan caracteres especiales (ej. `COPA-2` → `copa-2`), con el prefijo `prop-` o `veh-` según el tipo.
- **Título:** se usa el título del copy de Web/SEO cuando existe (más trabajado). Si no hay copy, se limpia el título de Notion quitando precios pegados al final (ej. `Terreno Ataco 16x65m $185k` → `Terreno Ataco 16x65m`).
- **Descripción:** se toma el cuerpo del copy de Web/SEO; se descartan los bloques de comisión y las líneas de contacto/CTA (regla ya definida en `docs/02-DATA-SCHEMA.md`). Si no hay copy aprobado, se usa "Info de WhatsApp Business" como respaldo, con la misma limpieza.
- **Specs faltantes:** cualquier campo sin dato se completa con `"—"`, nunca se deja vacío o `undefined` — evita que la tarjeta o la ficha se vean rotas.

---

## Salida y contrato con Web Interface

La única salida hoy es `js/data.js`: un arreglo `listings` de objetos, cada uno con `id`, `type`, `title`, `price`, `location`, `badge` (opcional), `operacion`, `summary`, `description`, `specs` (objeto con las claves fijas según el tipo), `features` (lista), `images` (lista). Web Interface asume que **todas** las claves están presentes — ninguna se omite, aunque el valor sea `"—"`.

Nada de este resultado llega hoy a Content Engine, Creative Engine ni Sales/Leads — cada uno opera de forma independiente (ver tabla de arriba).

---

## Manual hoy vs. qué haría falta para automatizar

Hoy, cada paso del flujo lo ejecuta una persona (o Claude Code) bajo pedido explícito, dentro de una sesión de trabajo. Para que fuera un proceso automatizado de verdad, faltaría:

- **Un disparador** — hoy no hay webhook de Notion ni tarea programada; el proceso arranca solo cuando alguien lo pide.
- **Ejecución fuera de una sesión de Claude** — hoy depende de que alguien invoque las herramientas de Notion dentro de una conversación; no es un script que corra por sí solo.
- **Validación automática de salida** — hoy los errores (como un símbolo mal escapado o un dato faltante) se detectan revisando el sitio a mano; no hay una prueba automática que lo verifique.
- **Actualización incremental** — hoy se regenera `js/data.js` completo cada vez; no existe lógica de "actualizar solo lo que cambió en Notion".

Este listado es más específico que el riesgo ya registrado en `docs/00-VISION.md` ("pipeline de sincronización real pendiente") — ahí queda el riesgo, aquí queda el detalle técnico de qué piezas faltan exactamente.

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Data Processing/Sync como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega.
- `docs/02-DATA-SCHEMA.md` — el diccionario de campos que este flujo usa en cada paso. No se repite ningún campo aquí.
- `docs/00-VISION.md` — el riesgo abierto de automatizar este pipeline ya está registrado ahí.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define el Data Engine como despliegue operativo del módulo Data Processing/Sync: fuentes, flujo de 9 pasos, transformaciones concretas, contrato de salida hacia Web Interface, conexión (y falta de conexión) con los demás módulos, y el detalle técnico de qué faltaría para automatizarlo. Documento validado como base oficial del proyecto. |
| 1.1 | 2026-07-19 | Ajusta la tabla de conexión con Content Engine: ya no se describe como "entrada" de un módulo a otro, sino como mismo origen (Notion) con responsabilidades distintas — Data Engine lee el campo Web/SEO directamente de Notion, no recibe una entrega de Content Engine. |
| 1.2 | 2026-07-19 | Quita las referencias a `docs/04-CONTENT-ENGINE.md`, eliminado en la consolidación de la documentación (ver `docs/01-CORE-PLATFORM.md` v2.0). |
