# 00-VISION.md

## Acostel OS — Visión del Proyecto

> **Versión:** 2.7 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza a medida que el proyecto avanza y se validan (o se descartan) supuestos.
> Ver [Registro de cambios](#registro-de-cambios) al final.

---

## Propósito

Construir una plataforma empresarial modular cuyo primer caso de uso real es **Acostel Bienes Raíces**, con una arquitectura que *podría* reutilizarse en el futuro para otros negocios (PIMFORCE, Carshtel, Pimentech, etc.) — **una vez que exista evidencia real de qué partes conviene compartir.**

No se construye una plataforma genérica desde el día uno. Se construye Acostel bien, y se observa qué patrones se repiten cuando exista un segundo negocio real.

---

## Filosofía

- La web es solo una interfaz. El contenido no vive "en el sitio", vive en Notion.
- La **fuente única de la verdad será siempre Notion** — para editar y capturar información, no necesariamente para lo que el sitio consulta en vivo (ver [Arquitectura del sistema](#arquitectura-del-sistema)).
- Toda la plataforma gira alrededor de datos centralizados, consistentes y reutilizables.
- **La automatización es una meta, no un punto de partida.** Mientras no exista un pipeline real, el proceso manual (humano o asistido por IA) es un paso legítimo — pero temporal, no el diseño final.

---

## Objetivos

- Reducir trabajo manual
- Centralizar la información
- Evitar duplicación de datos
- Facilitar automatizaciones futuras
- Construir módulos reutilizables — **solo cuando la reutilización esté probada, no anticipada**
- Minimizar el uso de IA para tareas repetitivas que deberían ser un proceso automatizado
- Escalar hacia nuevos negocios sin repetir trabajo innecesario

---

## No-objetivos (por ahora)

Explícito, para que el alcance no crezca solo:

- No se está construyendo un backend propio ni una base de datos separada de Notion todavía.
- No se está construyendo el "Core Platform" compartido todavía (condición completa en [Visión a largo plazo](#visión-a-largo-plazo)).
- No se están construyendo pagos, autenticación de usuarios finales, ni panel de administración propio.
- No se está optimizando para alto tráfico o múltiples países — el foco es El Salvador, un solo idioma, un solo negocio activo.

---

## Principios

1. **Fuente única de la verdad en Notion** — para contenido y datos de negocio. (Ver matiz en Arquitectura.)
2. **Frontera clara entre datos públicos e internos** — cada campo de Notion que alimenta al sitio debe estar explícitamente marcado como público o interno. Nunca se asume; se declara (detalle en [Modelo de datos](#modelo-de-datos-y-frontera-públicointerno)).
3. **Arquitectura modular** — pero modular no significa genérica desde el inicio. Un módulo se separa cuando ya existe, no antes.
4. **Reutilización antes que reconstrucción** — aplica una vez que exista un segundo caso de uso real. Reutilizar algo que no se ha probado dos veces es adivinar, no reutilizar.
5. **Automatizar solo después de validar manualmente el proceso completo** (ver [Regla de trabajo](#regla-de-trabajo)).
6. **Simplicidad antes que complejidad** — incluye no construir escalabilidad que todavía no se necesita. Las decisiones de hoy no deben bloquear el futuro, pero tampoco deben construirlo por adelantado. Ante la duda, se elige lo simple.
7. **Resiliencia ante fallos de la fuente de datos** — el sitio debe seguir funcionando (mostrando el último dato válido) si Notion no responde o la sincronización falla.
8. **Seguridad y control de acceso explícitos** — quién puede editar Notion, quién tiene permisos de escritura en el repositorio, cómo se gestionan credenciales y tokens, por módulo.

---

## Arquitectura del sistema

Estado actual (real, no aspiracional):

```
Notion (captura y edición de contenido)
      │
      │  hoy: extracción manual asistida por IA, bajo demanda
      │  meta: pipeline de sincronización programado o por webhook
      ▼
Capa de datos del sitio (hoy: js/data.js, generado por lote)
      │
      ▼
Sitio web estático (HTML/CSS/JS) — la interfaz
```

**Punto clave:** hoy, "sincronizar con Notion" significa que alguien (o una IA) ejecuta manualmente una exportación y transforma los datos a mano. Esto **no es el diseño final** — es un atajo válido para el MVP, pero debe quedar registrado como deuda técnica explícita, no confundirse con automatización real. Automatizar esto de verdad implicaría un proceso programado (ej. una función que corre en un horario, o que se dispara cuando algo cambia en Notion) que haga el mismo trabajo sin intervención humana ni de IA en cada ocasión.

**Estrategia de imágenes:** los archivos de imagen de Notion no son directamente enlazables desde un sitio público (son adjuntos internos con URLs temporales). Mientras no se defina una estrategia distinta, las imágenes reales se suben directamente al repositorio del sitio (no se leen desde Notion), y Notion solo guarda referencia/metadatos.

**Estrategia de contacto (decisión confirmada; corresponde al módulo *Sales / Leads* en `docs/01-CORE-PLATFORM.md`):** WhatsApp es el canal principal de contacto para el MVP. El formulario de contacto ya está implementado como canal secundario, capturando los datos estructurados definidos aquí (nombre, contacto, mensaje, referencia de la ficha) — aunque todavía sin conexión a un CRM.

---

## Modelo de datos y frontera público/interno

Por cada entidad sincronizada desde Notion (Propiedad, Vehículo, Copy, futuro Lead), debe existir una distinción explícita:

| Tipo de dato | Ejemplo | ¿Visible en el sitio? |
|---|---|---|
| Público | Precio de venta, ubicación general, descripción, características | Sí |
| Interno | Comisión, precio mínimo/final aceptable, contacto del propietario, quién trajo el anuncio | No, nunca |

Esta tabla es conceptual. El mapeo exacto, campo por campo, de cada base de Notion vive en `docs/02-DATA-SCHEMA.md` — no depender de "limpiar el texto a mano cada vez" fue exactamente el problema que llevó a documentarlo ahí.

---

## MVP Inicial

Priorizado (no todo tiene el mismo peso):

**Debe tener (indispensable):**
- Sitio web profesional
- Propiedades y vehículos con datos reales (import desde Notion, aunque sea manual por ahora)
- Fichas completas con imágenes y contenido
- Botón de WhatsApp funcional como canal principal
- SEO básico optimizado

**Debería tener (importante, no bloqueante):**
- Filtros de búsqueda (tipo, precio, ubicación)
- Formulario de contacto como canal secundario, con datos estructurados

**Podría tener (deseable, no urgente):**
- Base preparada para automatizaciones futuras del pipeline Notion → sitio
- Integración del formulario con un CRM

---

## Visión a largo plazo

Acostel es el primer módulo real del sistema. **Esta sección es intencionalmente especulativa** — no compromete decisiones de arquitectura hoy.

La misma plataforma *podría* evolucionar para soportar:
- PIMFORCE (e-commerce)
- Carshtel (vehículos)
- Pimentech (tecnología)
- Nuevos negocios futuros

**Condición explícita:** no se construye infraestructura compartida ("Core Platform") hasta que exista un segundo módulo real en desarrollo. Cuando eso ocurra, se identifican los patrones que de verdad se repitieron entre Acostel y ese segundo módulo (probablemente: patrón de catálogo con filtros, componente de contacto por WhatsApp, pipeline de sincronización con Notion, sistema de diseño visual) — y recién ahí se extraen a un núcleo compartido.

---

## Regla de trabajo

Antes de construir cualquier funcionalidad:

1. **Diseñarla** — definir qué problema resuelve y cómo se vería.
2. **Operarla manualmente** — hacerla a mano (o con ayuda puntual de IA) el tiempo suficiente para entender el proceso real, sus casos raros y sus excepciones.
3. **Implementarla** — construir el soporte de software una vez que el proceso ya se entiende de verdad.
4. **Automatizarla** — quitar la intervención humana (o de IA) repetitiva, una vez que el proceso implementado ya es estable.

Nunca automatizar sin haber operado el proceso manualmente primero. Nunca quedarse en "manual asistido por IA" indefinidamente cuando el volumen ya justifica automatizar de verdad.

---

## Riesgos abiertos

Lista viva de pendientes sin resolver — no se repiten explicaciones ya dadas arriba, solo se registra que siguen abiertos:

- Pipeline de sincronización Notion → sitio real (ver [Arquitectura del sistema](#arquitectura-del-sistema)).
- Comportamiento del sitio si Notion está caído (principio 7).
- Política de acceso/seguridad documentada (principio 8).
- Métricas de éxito del MVP — aún sin definir con el cliente. Candidatas: tiempo entre "listo en Notion" y "publicado", contactos generados por WhatsApp, velocidad de carga, fichas activas mantenidas al día.
- El estado "Revisión" de las fichas en Notion no se usa de forma consistente (todo permanece en "Por revisar").
- Content Engine: los canales que no son Web/SEO (WhatsApp, Instagram, TikTok, Facebook, Marketplace) ya tienen copy redactado en Notion, pero no están conectados a nada dentro de este sistema.
- Creative Engine: la producción de creativos diseñados en Canva (brand kit, plantilla base, más de 15 variaciones por ficha) ya es una práctica establecida, pero sin ningún pipeline que la conecte a este sistema. El pipeline de fotos reales hacia el sitio está en construcción.
- Distribution: la publicación en redes sociales y marketplace es 100% manual, sin conexión a este sistema.
- Publishing: sin entorno de staging/preview (todo push a la única rama que existe hoy va directo a producción); la configuración de build de Netlify no está versionada (no hay `netlify.toml`); no hay pruebas automáticas (CI) antes de publicar.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | (original) | Documento inicial: propósito, filosofía, objetivos, principios, MVP, visión a largo plazo, regla principal, enfoque estratégico. |
| 2.0 | 2026-07-18 | Revisión crítica de arquitectura. Se agregan: no-objetivos, frontera público/interno de datos, sección de arquitectura del sistema (estado real vs. aspiracional), modelo de datos, MVP priorizado (MoSCoW), riesgos abiertos, métricas pendientes, y este registro de cambios. Se corrige la secuencia de la "Regla Principal". Se marca la visión a largo plazo como especulativa para evitar abstracción prematura. Se confirma: WhatsApp como canal principal, formularios de contacto como canal secundario (no reemplazados), con arquitectura lista para integrar CRM más adelante. Documento ubicado en `Acostel-Web/docs/` por decisión explícita de no crear un repositorio separado todavía. |
| 2.1 | 2026-07-18 | Pasada de simplificación: se eliminan redundancias (la regla de "no construir Core Platform hasta un segundo módulo real" ahora vive en un solo lugar; se fusionan los principios de simplicidad y escalabilidad prematura; se quitan las etiquetas "(principio nuevo)" que ya documentaba este registro). Se fusiona "Métricas de éxito" dentro de "Riesgos abiertos" para no repetir una sección casi vacía. **Documento validado como base oficial del proyecto.** |
| 2.2 | 2026-07-18 | Revisión de coherencia cruzada con `CLAUDE.md` y `docs/01-CORE-PLATFORM.md`. Se agregan tres riesgos abiertos identificados en `01-CORE-PLATFORM.md` que no estaban registrados aquí (canales de Content Engine sin conectar, Creative Engine sin pipeline, Distribution 100% manual), para que la referencia cruzada entre ambos documentos sea exacta. Se conecta "Estrategia de contacto" con el módulo *Sales / Leads*. |
| 2.3 | 2026-07-19 | La tabla de "Modelo de datos" se marca como conceptual y ahora apunta a `docs/02-DATA-SCHEMA.md`, documento nuevo con el mapeo campo por campo real de cada base de Notion. Cierra el vacío de que el contrato de datos solo existía en la memoria de la sesión. |
| 2.4 | 2026-07-19 | Corrige el riesgo abierto de Creative Engine con el estado real verificado directamente en Canva: la producción de creativos ya es una práctica establecida (brand kit, plantilla, variaciones), no algo que recién empieza como decía antes. Apunta a `docs/05-CREATIVE-ENGINE.md`, documento nuevo. |
| 2.5 | 2026-07-19 | Agrega riesgo abierto de Publishing (sin staging, configuración de Netlify no versionada, sin CI) — hallazgos nuevos de `docs/07-PUBLISHING.md`, no registrados hasta ahora porque Publishing nunca se había revisado con este nivel de detalle. |
| 2.6 | 2026-07-19 | Se implementó el formulario de contacto. Corrige la frase "mientras el formulario no exista, WhatsApp es el único canal activo" en Estrategia de contacto, que ya no era cierta. |
| 2.7 | 2026-07-19 | Consolidación de la documentación por decisión del cliente: se eliminan los documentos descriptivos 04–09 (eran mapas de procesos manuales, no herramientas; recuperables en Git) y sus hallazgos se absorben en `docs/01-CORE-PLATFORM.md` v2.0. Se actualizan las referencias de este documento. El foco pasa de documentar el sistema a construirlo — empezando por el pipeline de fotos reales al sitio. |
