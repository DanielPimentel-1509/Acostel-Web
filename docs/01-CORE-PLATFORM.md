# 01-CORE-PLATFORM.md

## Acostel OS — Mapa del Sistema

> **Versión:** 2.0 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo. Esta versión reemplaza y consolida las v1.0–v1.11 y los antiguos documentos 04–09 (recuperables en el historial de Git). Regla: si algo no existe, se marca como futuro — no se describe como si existiera.

---

## Qué es esto

`docs/00-VISION.md` define hacia dónde va el proyecto. `CLAUDE.md` define cómo se trabaja. **Este documento es el mapa de una página del sistema real** — qué piezas existen, cómo se conectan, y qué es manual vs. automático. Los únicos procesos con receta operativa propia son los que se ejecutan de verdad: `docs/02-DATA-SCHEMA.md` (qué campo es público/interno) y `docs/03-DATA-ENGINE.md` (cómo se sincroniza Notion → sitio).

---

## Flujo real

```
Notion (datos + copies)          Fotos (carpeta procesada)      Canva (creativos para redes)
        │                                 │                              │
        ▼                                 ▼                              ▼
  Data Engine ──────────────► repositorio Acostel-Web ◄─── (pipeline en construcción)
  (manual, asistido por IA)               │
                                          ▼
                              GitHub → Netlify (automático)
                                          │
                                          ▼
                            Sitio en vivo (acostel.netlify.app)
                                          │
                              WhatsApp  /  Formulario
                            (conversación) (Netlify Forms)
```

---

## Los 8 módulos, estado real

| Módulo | Estado | Realidad hoy |
|---|---|---|
| **Notion (Data Source)** | Existe | Fuente única de la verdad: bases Propiedades, Vehículos, Copies por Canal. Dueño: el cliente. |
| **Data Engine** | Existe (manual) | Sincroniza Notion → `js/data.js` bajo demanda. Receta completa en `docs/03-DATA-ENGINE.md`. Candidato #1 a automatizar. |
| **Content Engine** | Existe (parcial) | Copies por canal redactados a mano en Notion. Solo el canal Web/SEO se usa (lo lee Data Engine). Los otros 5 canales existen pero nada los consume. |
| **Creative Engine** | En construcción activa | Fotos ya organizadas por código en carpeta local del cliente (pipeline hacia el sitio en curso). En Canva: brand kit + plantilla base + ~15 variaciones para redes, todo manual, sin Brand Template de autofill. |
| **Web Interface** | Existe | Sitio estático sin backend: 44 fichas, filtros, formulario. Todo lo que muestra viene de `js/data.js`; nunca consulta Notion ni Canva en vivo. |
| **Publishing** | Existe (automático) | Único módulo 100% automático: push a la rama → Netlify publica. Depende de que todo lo anterior ya se haya hecho a mano. |
| **Sales / Leads** | Existe (parcial) | WhatsApp (4 enlaces con mensaje pre-llenado) + formulario con captura estructurada. Sin CRM, sin conexión a Notion. |
| **Distribution** | Existe (manual) | Publicación en Instagram/TikTok/Facebook/Marketplace, 100% a mano desde el teléfono, sin registro de qué se publicó. |

---

## Hallazgos clave (verificados, no asumidos)

- **El mensaje de WhatsApp está duplicado:** el texto de los botones del sitio vive en `js/common.js`; el canal "WhatsApp" de Copies por Canal en Notion es otro texto distinto. Nada los sincroniza. Pendiente decidir cuál manda.
- **Las respuestas del formulario quedan en el panel de Netlify** — sin notificación automática configurada; hay que entrar a revisarlas. Configurar el aviso por correo es una tarea única en el panel.
- **La configuración de Netlify no está versionada** (no hay `netlify.toml`) y no hay staging ni CI: todo push a la única rama del repositorio va directo a producción.
- **Datos internos que nunca deben publicarse** (comisiones, precios mínimos, contactos de propietarios): la lista campo por campo vive en `docs/02-DATA-SCHEMA.md` y es de cumplimiento obligatorio en cada sincronización.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0–1.11 | 2026-07-18/19 | Historia completa en Git. Definición inicial de los 8 módulos y seis documentos descriptivos por módulo (04–09). |
| 2.0 | 2026-07-19 | Consolidación: se eliminan los documentos 04–09 (eran mapas descriptivos de procesos manuales, no herramientas de trabajo) y este documento absorbe sus hallazgos verificados en una página. La documentación del proyecto queda en 4 archivos: visión, comportamiento, contrato de datos y receta de sincronización. Creative Engine pasa de "vacío documentado" a "en construcción activa" (pipeline de fotos reales al sitio). |
