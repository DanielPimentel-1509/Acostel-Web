# 07-PUBLISHING.md

## Acostel OS — Publishing

> **Versión:** 1.0 — Validado como base oficial del proyecto
> **Última actualización:** 2026-07-19
> **Estado:** Documento vivo — se actualiza si cambia la integración GitHub → Netlify, o si se agrega staging, CI o control de versiones sobre la configuración de build.

---

## Rol dentro del sistema

Publishing es el módulo ya definido en `docs/01-CORE-PLATFORM.md` (módulo 6): lleva cualquier cambio del repositorio al sitio en vivo, sin intervención manual.

**Precisión importante:** Publishing es el único módulo 100% automático hoy, pero esa automatización **empieza después de que todo lo anterior ya ocurrió a mano**. Depende por completo de procesos manuales en Data Engine, Content Engine y Creative Engine — Publishing no genera contenido, no decide qué publicar, y no sabe si lo que va a publicar está completo o correcto. Automatizar la entrega no es lo mismo que automatizar el sistema: que este módulo sea automático no convierte al conjunto en un pipeline completo.

**Conexión con los demás módulos (hoy):**

| Módulo | Relación con Publishing |
|---|---|
| Data Engine | Quien entrega el commit que dispara todo esto — el paso "Entregar" de `docs/03-DATA-ENGINE.md` (commit + push) es manual; Publishing solo reacciona a que ya ocurrió. |
| Content Engine, Creative Engine | Sin relación directa. Su trabajo ya debe estar incorporado al repositorio (vía Data Engine, o subido a mano) antes de que Publishing actúe — Publishing no los consulta. |
| Web Interface (Site) | Es lo que se despliega. Publishing republica el repositorio completo, no partes específicas. |
| GitHub | Dónde vive el disparador: cualquier push a la rama activa. |
| Netlify | Quien ejecuta el deploy real. |

---

## Qué hace hoy realmente

Verificado directamente en el repositorio (no asumido): **hoy existe una sola rama en todo el repositorio remoto**, `claude/acostel-website-build-e5gau7` — no hay una rama `main` ni ninguna otra. Cualquier push a esa rama se refleja en el sitio en vivo (`acostel.netlify.app`) sin que nadie tenga que intervenir después del push.

---

## Cómo ocurre el deploy actual

La conexión es la integración nativa **GitHub → Netlify**: Netlify observa la rama y publica automáticamente cuando detecta un push nuevo.

Se confirmó que **no existe ningún archivo `netlify.toml`** en el repositorio, ni carpeta `.github/workflows`. Esto significa que la configuración de build (qué rama observar, qué carpeta publicar, variables de entorno) vive enteramente en el panel de Netlify — **fuera del repositorio y fuera de control de versiones**. Nadie puede ver el historial de esa configuración revisando el código; solo existe donde se configuró, en la cuenta de Netlify.

Como el sitio es estático y sin paso de compilación (ya documentado en `docs/06-WEB-INTERFACE.md`), "publicar" aquí no implica compilar nada — es servir los archivos del repositorio tal como están.

---

## Qué partes son automáticas y cuáles no

**Automático:** detectar que hubo un push a la rama activa, y publicar el resultado sin intervención humana. Es el único punto del sistema donde esto es cierto.

**Manual:** todo lo que ocurre antes de ese push — el ciclo completo de Data Engine, la redacción en Content Engine, el diseño en Creative Engine — y también la configuración inicial de Netlify (conectar el repositorio, elegir la rama, definir variables), que se hizo una sola vez, a mano, fuera de este repositorio.

---

## Cómo se conecta con Web Interface

Publishing no conoce el contenido del sitio: no distingue si cambió una línea de texto o los 44 listados completos. Republica el repositorio entero cada vez, sin ninguna lógica de "qué cambió" — la responsabilidad de que el contenido esté correcto ya quedó resuelta antes, en Data Engine (ver `docs/03-DATA-ENGINE.md`, paso "Verificar").

---

## Qué falta para un pipeline completo

- **No hay entorno de staging o preview** — todo push a la única rama que existe hoy se refleja directo en producción, sin una revisión previa en un entorno separado.
- **La configuración de Netlify no está versionada** — al no existir `netlify.toml`, un cambio en esa configuración no queda registrado en ningún historial revisable.
- **No hay pruebas automáticas antes de publicar** — confirmado: no existe ningún flujo de CI configurado en el repositorio. Las pruebas que se han hecho hasta ahora (ej. con Playwright) fueron manuales, dentro de una sesión de trabajo, no parte de este proceso.
- **Un solo branch cumple doble función** — al no existir una rama separada de producción, "rama de trabajo" y "rama que ve el público" son literalmente la misma cosa hoy, no por diseño sino porque nunca se creó otra.

---

## Relación con la documentación

- `docs/01-CORE-PLATFORM.md` — define Publishing como módulo (dueño, estado, responsabilidad). Este documento no repite eso, solo lo despliega.
- `docs/03-DATA-ENGINE.md` — el paso "Entregar" (commit + push) que dispara este módulo. No se repite ese flujo aquí.
- `docs/06-WEB-INTERFACE.md` — qué se despliega exactamente. Este documento no repite ese inventario.
- `docs/00-VISION.md` — los hallazgos nuevos de este documento (sin staging, config fuera de versión, sin CI, un solo branch) se agregan ahí como riesgos abiertos, porque hasta ahora ese documento no registraba ninguno para Publishing.

---

## Registro de cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-07-19 | Documento inicial. Define Publishing como el único módulo 100% automático hoy, dejando explícito que esa automatización depende por completo de procesos manuales en los módulos anteriores (Data Engine, Content Engine, Creative Engine) y no equivale a un pipeline completo. Verifica en el repositorio real: una sola rama existe (no hay `main`), no hay `netlify.toml` ni CI configurado — la configuración de build vive fuera del control de versiones. Documento validado como base oficial del proyecto. |
