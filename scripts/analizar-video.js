/* ============================================
   PIMTEL — Analizador de videos (Fase 1)
   --------------------------------------------
   Le pasás uno o varios videos de una propiedad/vehículo y esta herramienta:
     1. Saca fotogramas del video (con ffmpeg).
     2. Se los manda a un modelo de IA con visión (Claude).
     3. La IA lee TODO el texto que aparezca en pantalla (kilometraje,
        precio, teléfonos, año, etc.) y DESCRIBE lo que ve.
     4. Te devuelve un borrador de ficha listo para revisar y pegar en
        js/data.js.

   NO publica nada ni toca la página: solo genera un borrador en pantalla
   (y opcionalmente en un archivo .json). Vos revisás y decidís qué usar.

   --------------------------------------------
   CÓMO USARLO
   --------------------------------------------
   1. Necesitás una clave de la API de Anthropic (con saldo). Se consigue en
      https://console.anthropic.com/  → API Keys.
   2. Poné la clave en una variable de entorno antes de correr el script:

        export ANTHROPIC_API_KEY="sk-ant-..."        (Mac/Linux)
        set    ANTHROPIC_API_KEY=sk-ant-...           (Windows CMD)

   3. Corré el script apuntando al/los video(s):

        node scripts/analizar-video.js images/listings/l2002013/video.mp4

      Podés pasar varios:

        node scripts/analizar-video.js  video1.mp4  video2.mp4

   Opciones (todas opcionales):
     --tipo=vehiculo | --tipo=propiedad   Ayuda a la IA (si no, la deduce sola)
     --fotogramas=10                      Cuántos cuadros mirar (por defecto 10)
     --guardar                            Guarda el borrador en <video>.borrador.json
     --modelo=claude-opus-5               Modelo a usar (por defecto claude-sonnet-5)

   Ejemplo completo:
     node scripts/analizar-video.js images/listings/l2002013/video.mp4 --tipo=vehiculo --guardar

   COSTO: cada video cuesta unos pocos centavos de dólar (depende de cuántos
   fotogramas se miren y del modelo). El modelo por defecto (Sonnet) es el más
   económico con buena calidad; --modelo=claude-opus-5 da la máxima calidad.
   ============================================ */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

// ---------- 1. Leer argumentos de la línea de comandos ----------
const args = process.argv.slice(2);
const opciones = {
  tipo: null,
  fotogramas: 10,
  guardar: false,
  modelo: "claude-sonnet-5",
};
const videos = [];

for (const arg of args) {
  if (arg.startsWith("--tipo=")) opciones.tipo = arg.slice(7).trim();
  else if (arg.startsWith("--fotogramas=")) opciones.fotogramas = Math.max(3, Math.min(20, parseInt(arg.slice(13), 10) || 10));
  else if (arg === "--guardar") opciones.guardar = true;
  else if (arg.startsWith("--modelo=")) opciones.modelo = arg.slice(9).trim();
  else if (arg.startsWith("--")) {
    console.error(`Opción no reconocida: ${arg}`);
    process.exit(1);
  } else {
    videos.push(arg);
  }
}

if (videos.length === 0) {
  console.error("Uso: node scripts/analizar-video.js <video.mp4> [más videos...] [--tipo=vehiculo] [--guardar]");
  console.error("Ejemplo: node scripts/analizar-video.js images/listings/l2002013/video.mp4 --guardar");
  process.exit(1);
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("Falta la clave de la API. Antes de correr el script hacé:");
  console.error('  export ANTHROPIC_API_KEY="sk-ant-..."   (Mac/Linux)');
  console.error("  set    ANTHROPIC_API_KEY=sk-ant-...      (Windows)");
  console.error("La clave se saca en https://console.anthropic.com/ → API Keys.");
  process.exit(1);
}

// ---------- 2. Sacar fotogramas del video con ffmpeg ----------
// Repartimos los fotogramas a lo largo de TODO el video (no solo el principio)
// y los achicamos a 1024px de ancho para que la IA lea bien el texto sin gastar
// de más. Devuelve una lista de rutas a imágenes .jpg temporales.
function extraerFotogramas(video, cantidad) {
  if (!fs.existsSync(video)) {
    throw new Error(`No se encontró el video: ${video}`);
  }

  // Duración del video en segundos (para repartir los cuadros parejo).
  let duracion = 0;
  try {
    const salida = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", video],
      { encoding: "utf8" }
    );
    duracion = parseFloat(salida.trim()) || 0;
  } catch (e) {
    throw new Error("No se pudo leer el video con ffprobe. ¿Está instalado ffmpeg? (" + e.message + ")");
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pimtel-frames-"));
  // fps = cantidad / duración → reparte 'cantidad' cuadros a lo largo del video.
  // Si el video es muy corto, igual sacamos al menos algunos cuadros.
  const fps = duracion > 0 ? cantidad / duracion : 1;
  const patron = path.join(dir, "frame-%03d.jpg");

  try {
    execFileSync(
      "ffmpeg",
      [
        "-i", video,
        "-vf", `fps=${fps},scale='min(1024,iw)':-2`,
        "-frames:v", String(cantidad),
        "-q:v", "3", // buena calidad JPEG
        "-y",
        patron,
      ],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
  } catch (e) {
    throw new Error("ffmpeg falló al sacar los fotogramas: " + (e.stderr ? e.stderr.toString() : e.message));
  }

  const frames = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jpg"))
    .sort()
    .map((f) => path.join(dir, f));

  if (frames.length === 0) {
    throw new Error("ffmpeg no generó ningún fotograma. Revisá que el archivo sea un video válido.");
  }
  return { dir, frames };
}

// ---------- 3. Armar el pedido a la IA ----------
const INSTRUCCIONES = `Sos un asistente que arma fichas para un catálogo de bienes raíces y vehículos en El Salvador (marca Pimtel).

Te voy a pasar varios FOTOGRAMAS de un video de una propiedad o un vehículo en venta. Tu trabajo:

1. Leé LITERALMENTE todo el texto que aparezca en pantalla en cualquier fotograma: kilometraje, precio, año, teléfonos, marca/modelo, medidas, nombres de zonas, cualquier dato. No inventes texto que no esté.
2. Observá y describí lo que se ve: estado general, características visibles (rines, techo solar, habitaciones, patio, acabados, etc.).
3. Devolvé UN borrador de ficha en formato JSON, y NADA MÁS (sin explicación antes ni después).

Reglas importantes:
- Si un dato NO aparece ni en el texto ni claramente en la imagen, poné "" (vacío). NO inventes datos.
- Los precios y kilometrajes van tal cual se ven (ej. "192,000 km", "$8,500").
- "textoEnPantalla" es la lista de todos los textos que leíste literalmente, para que el humano verifique.
- "confianza" es tu nivel de seguridad general: "alta", "media" o "baja".

Estructura EXACTA del JSON a devolver:
{
  "tipo": "vehiculo" | "propiedad",
  "titulo": "",
  "precio": "",
  "ubicacion": "",
  "resumen": "",
  "descripcion": "",
  "specs": {
    // Para vehiculo: anio, kilometraje, transmision, combustible, motor
    // Para propiedad: habitaciones, banos, areaConstruccion, areaTerreno, parqueos
  },
  "caracteristicas": [],
  "telefonos": [],
  "textoEnPantalla": [],
  "confianza": "alta" | "media" | "baja",
  "notasParaRevisar": ""
}`;

async function analizarConIA(frames, video) {
  // Cada fotograma se manda como una imagen (en base64).
  const bloquesImagen = frames.map((ruta) => ({
    type: "image",
    source: {
      type: "base64",
      media_type: "image/jpeg",
      data: fs.readFileSync(ruta).toString("base64"),
    },
  }));

  const pista = opciones.tipo
    ? `\n\nPista del usuario: esto es un ${opciones.tipo}.`
    : "";

  const contenido = [
    { type: "text", text: `Video: ${path.basename(path.dirname(video))}/${path.basename(video)}. Son ${frames.length} fotogramas en orden.${pista}` },
    ...bloquesImagen,
  ];

  const cuerpo = {
    model: opciones.modelo,
    max_tokens: 2000,
    system: INSTRUCCIONES,
    messages: [{ role: "user", content: contenido }],
  };

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(cuerpo),
  });

  if (!resp.ok) {
    const texto = await resp.text();
    throw new Error(`La API respondió ${resp.status}: ${texto}`);
  }

  const data = await resp.json();
  if (data.stop_reason === "refusal") {
    throw new Error("El modelo rechazó el pedido por seguridad. Revisá el contenido del video.");
  }

  const textoRespuesta = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  // La IA a veces envuelve el JSON en ```json ... ```; lo limpiamos.
  const limpio = textoRespuesta.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return { json: JSON.parse(limpio), crudo: textoRespuesta };
  } catch (e) {
    // Si no se pudo parsear, devolvemos el texto crudo para que el humano lo vea.
    return { json: null, crudo: textoRespuesta };
  }
}

// ---------- 4. Correr todo ----------
(async function main() {
  for (const video of videos) {
    console.log(`\n========================================`);
    console.log(`Analizando: ${video}`);
    console.log(`========================================`);

    let temp = null;
    try {
      const { dir, frames } = extraerFotogramas(video, opciones.fotogramas);
      temp = dir;
      console.log(`  ✓ ${frames.length} fotogramas extraídos. Consultando a la IA (${opciones.modelo})...`);

      const { json, crudo } = await analizarConIA(frames, video);

      if (json) {
        console.log("\n--- BORRADOR DE FICHA (revisar antes de usar) ---\n");
        console.log(JSON.stringify(json, null, 2));
        if (json.confianza && json.confianza !== "alta") {
          console.log(`\n  ⚠ Confianza ${json.confianza}: revisá bien los datos antes de publicar.`);
        }
        if (opciones.guardar) {
          const destino = video.replace(/\.[^.]+$/, "") + ".borrador.json";
          fs.writeFileSync(destino, JSON.stringify(json, null, 2));
          console.log(`\n  ✓ Guardado en: ${destino}`);
        }
      } else {
        console.log("\n  ⚠ La IA no devolvió un JSON válido. Respuesta cruda:\n");
        console.log(crudo);
      }
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
    } finally {
      // Borramos los fotogramas temporales.
      if (temp) fs.rmSync(temp, { recursive: true, force: true });
    }
  }
})();
