# 01-CORE-PLATFORM.md

## Acostel OS — Núcleo del Sistema

> **Versión:** 1.4 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — refleja el sistema *tal como existe hoy*. Se actualiza cuando un módulo cambia de estado (de futuro a existente, o de manual a automatizado).

---

## Propósito de este documento

`docs/00-VISION.md` define la dirección del proyecto y por qué existe. `CLAUDE.md` define cómo se trabaja. **Este documento define de qué piezas está hecho el sistema hoy** — no una arquitectura genérica para negocios futuros, sino el mapa real de Acostel tal como funciona ahora mismo.

Regla de este documento: si algo no existe todavía, se marca como **Futuro**. No se describe como si ya existiera.

---

## Diagrama de flujo (estado actual)

```
Notion (Data Source)
 ├─ Propiedades / Vehículos ............. datos estructurados (precio, specs, ubicación)
 └─ Copies por Canal ..................... texto redactado por canal (Content Engine)
        │
        ├───────────────────┬───────────────────────┐
        ▼                   ▼                        ▼
 Data Processing/Sync  Content Engine          Creative Engine
 (hoy: manual,         (hoy: autoría humana    (hoy: fotos crudas
 asistido por IA)      dentro de Notion)       + creativos en curso)
        │                   │                        │
        └─────────┬─────────┴────────────────────────┘
                   ▼
           Web Interface (Site)
           (repositorio Acostel-Web)
                   │
                   ▼
              Publishing
        (GitHub → Netlify, automático)
                   │
                   ▼
          Sitio en vivo (acostel.netlify.app)
                   │
                   ▼
              Sales / Leads
         (WhatsApp — clic del visitante)


Aparte, sin conectar al flujo de arriba:

Content Engine (canales Instagram / TikTok / Facebook / Marketplace)
        +
Creative Engine (fotos / creativos)
                   │
                   ▼
              Distribution
       (publicación manual, fuera de este sistema)
```

---

## Los 8 módulos

| # | Módulo | Estado | Responsabilidad |
|---|---|---|---|
| 1 | **Notion (Data Source)** | Existe | Capturar y mantener la información real del negocio: datos estructurados y contenido redactado. Punto de entrada de todo. |
| 2 | **Data Processing / Sync** | Existe (parcial) | Leer los datos estructurados de Notion, aplicar la frontera público/interno, generar los datos que consume el sitio. |
| 3 | **Content Engine** | Existe (parcial) | Producir el texto de cada ficha, adaptado por canal. |
| 4 | **Creative Engine** | Existe (parcial) | Producir el material visual de cada ficha. |
| 5 | **Web Interface (Site)** | Existe | Mostrar catálogo, fichas, filtros y canal de contacto. |
| 6 | **Publishing** | Existe | Llevar cualquier cambio del repositorio al sitio en vivo. |
| 7 | **Sales / Leads** | Existe (parcial) | Recibir y gestionar el contacto de un cliente potencial. |
| 8 | **Distribution** | Existe (parcial) | Publicar el contenido y los creativos en canales externos. |

Ningún módulo es 100% "Futuro" — todos tienen al menos una parte real hoy. Lo que varía es cuánto de cada uno está automatizado vs. manual, y cuánto está conectado al resto del sistema vs. viviendo aislado.

---

### 1. Notion (Data Source)

**Dueño:** el cliente. **Dónde vive:** workspace de Notion — bases "🏠 Propiedades", "🚗 Vehículos", "📣 Copies por Canal".

Es la fuente única de la verdad (principio ya establecido en `docs/00-VISION.md`). Contiene dos tipos de información distintos que antes se trataban como una sola cosa: datos estructurados (precio, ubicación, specs) y contenido redactado (los copies). Separarlos conceptualmente es lo que permitió identificar Content Engine como módulo propio.

**Futuro:** si se agrega un segundo negocio (Carshtel, etc.), reutiliza el mismo patrón de bases de datos — no antes.

---

### 2. Data Processing / Sync

**Dueño:** Claude Code, bajo dirección del cliente. **Dónde vive:** no existe como proceso independiente todavía — es una tarea que se ejecuta bajo demanda.

Lee las bases de Propiedades y Vehículos, aplica la frontera público/interno (definida en `docs/00-VISION.md`), y genera los datos que consume el sitio (hoy: `js/data.js`).

**Hoy:** manual, asistido por IA, bajo demanda. **Futuro:** un proceso programado o disparado por webhook que haga lo mismo sin intervención manual — es el candidato número uno a automatizar, ya señalado como riesgo abierto en `docs/00-VISION.md`.

El despliegue operativo completo de este módulo (flujo paso a paso, transformaciones concretas, contrato de salida) vive en `docs/03-DATA-ENGINE.md` — no se repite aquí.

---

### 3. Content Engine

**Dueño:** el cliente, hoy. **Dónde vive:** base "📣 Copies por Canal — Acostel" en Notion.

Transforma los datos de una ficha en texto redactado, distinto por canal: Web/SEO, WhatsApp, Instagram, TikTok, Facebook, Marketplace. Hoy es 100% autoría humana dentro de Notion — no hay generación automática de copy todavía.

**Conectado al sistema:** solo el canal Web/SEO — es el que Data Processing/Sync lee para alimentar el sitio. Los demás canales existen en Notion pero no están conectados a nada dentro de este sistema (ver Distribution).

**Nota:** el mensaje de WhatsApp que ofrece el sitio hoy está escrito directamente en el código (`js/common.js`), no se toma del canal "WhatsApp" de Content Engine — son dos cosas separadas que podrían converger más adelante.

**Futuro:** generación asistida de copies para los demás canales a partir del mismo dato base, en vez de redactar cada uno por separado.

El despliegue operativo completo de este módulo (estructura de contenido por canal, proceso de generación, relación exacta con Data Engine) vive en `docs/04-CONTENT-ENGINE.md` — no se repite aquí.

---

### 4. Creative Engine

**Dueño:** el cliente (en desarrollo). **Dónde vive:** adjuntos de Notion (fotos crudas) + `images/site/` y `images/listings/` en el repositorio (logo, favicon, y lo que se vaya subiendo).

Produce el material visual de cada ficha: fotos, portadas, creativos diseñados.

**Hoy:** las fotos crudas en Notion no son directamente utilizables por el sitio (URLs internas temporales); las fichas usan imágenes de marcador. El logo y el favicon ya están integrados. El cliente está por empezar a producir creativos diseñados — todavía sin un pipeline definido de cómo entran al sistema.

**Futuro:** definir ese pipeline (dónde se suben, con qué nombre, cómo se conectan a cada ficha) en cuanto exista un primer lote real de creativos.

---

### 5. Web Interface (Site)

**Dueño:** repositorio `Acostel-Web`. **Dónde vive:** `index.html`, `ficha.html`, `css/`, `js/`.

Consume lo que producen Data Processing/Sync (datos), Content Engine (texto del canal Web/SEO) y Creative Engine (imágenes), y los muestra como catálogo, fichas, filtros y contacto.

**Hoy:** completo y en producción. **Futuro:** plantilla reutilizable para otro negocio, una vez que exista un segundo caso real (condición ya establecida en `docs/00-VISION.md`).

---

### 6. Publishing

**Dueño:** infraestructura automática. **Dónde vive:** GitHub (rama de trabajo activa del repositorio) → Netlify.

Lleva cualquier cambio del repositorio al sitio en vivo (`acostel.netlify.app`) sin intervención manual.

**Es el único módulo 100% automatizado hoy** — vale la pena tenerlo presente como referencia de cómo se ve un módulo terminado, cuando se automaticen los demás.

---

### 7. Sales / Leads

**Dueño:** WhatsApp Business (externo al sistema). **Dónde vive:** conversación fuera del sitio, iniciada por un botón de WhatsApp.

Recibe al cliente potencial que llega desde el sitio.

**Hoy:** WhatsApp es el único canal, sin registro estructurado de quién contactó ni por qué ficha. **Futuro:** formulario de contacto como canal secundario + integración con un CRM — ya definido como "debería/podría tener" en el MVP de `docs/00-VISION.md`, no se repite aquí.

---

### 8. Distribution

**Dueño:** el cliente, fuera de este sistema. **Dónde vive:** Instagram, TikTok, Facebook, Marketplace — directamente, sin pasar por este repositorio.

Toma lo que produce Content Engine (copies de esos canales) y Creative Engine (visuales) y lo publica manualmente en cada red.

**Hoy:** el contenido para estos canales ya existe en Notion, pero la publicación es 100% manual y no está conectada a este sistema. **Futuro:** publicación automática multi-canal — no se construye hasta que Content Engine y Creative Engine estén más maduros.

---

## Relación con la documentación

- `docs/00-VISION.md` — dirección del proyecto y arquitectura de capas (Notion → sync → sitio). Este documento no repite ese diagrama; lo desglosa por módulo.
- `CLAUDE.md` — cómo trabaja Claude en este proyecto, incluida la regla de cuándo pausar (aplica también a cambios en estos módulos).
- `docs/02-DATA-SCHEMA.md` — el contrato exacto de campos que leen Data Processing/Sync y Content Engine. Este documento no lo repite.
- `docs/03-DATA-ENGINE.md` — el despliegue operativo completo del módulo Data Processing/Sync (flujo, transformaciones, contrato de salida). Este documento solo lo referencia.
- `docs/04-CONTENT-ENGINE.md` — el despliegue operativo completo del módulo Content Engine (estructura de contenido, proceso de generación, relación con Data Engine). Este documento solo lo referencia.
- Los riesgos abiertos de estos módulos (sync manual, sin CRM, etc.) ya están registrados en `docs/00-VISION.md` → Riesgos abiertos. No se duplican aquí.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-18 | Documento inicial. Define 8 módulos reales del sistema (Notion, Data Processing/Sync, Content Engine, Creative Engine, Web Interface, Publishing, Sales/Leads, Distribution), su estado actual (existe / existe parcial), responsabilidades, y notas puntuales de escalabilidad. Content Engine se identifica como módulo propio, separado de Notion y Creative Engine, tras revisión con el cliente. Documento validado como base oficial del proyecto. |
| 1.1 | 2026-07-18 | Revisión de coherencia cruzada con `docs/00-VISION.md` y `CLAUDE.md`. Corrige la ruta de referencia a `00-VISION.md` (faltaba `docs/`). Generaliza la referencia a la rama de Git en Publishing (ya no fija un nombre de rama específico, que era temporal a esta sesión). Ajusta el "dueño" de Data Processing/Sync a "Claude Code, bajo dirección del cliente" para no implicar autoridad propia sobre el módulo. La afirmación de que los riesgos de estos módulos "ya están registrados en 00-VISION.md" ahora es exacta — se agregaron ahí los tres que faltaban. |
| 1.2 | 2026-07-19 | Agrega referencia a `docs/02-DATA-SCHEMA.md` (documento nuevo) en "Relación con la documentación". |
| 1.3 | 2026-07-19 | Agrega referencia a `docs/03-DATA-ENGINE.md` (documento nuevo, despliegue operativo del módulo Data Processing/Sync) en la sección del módulo y en "Relación con la documentación". |
| 1.4 | 2026-07-19 | Agrega referencia a `docs/04-CONTENT-ENGINE.md` (documento nuevo, despliegue operativo del módulo Content Engine) en la sección del módulo y en "Relación con la documentación". |
