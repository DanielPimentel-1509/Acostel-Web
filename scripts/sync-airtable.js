#!/usr/bin/env node
/* ============================================
   PIMTEL — Sincronización Airtable → sitio web
   ------------------------------------------------
   Lee la base de Airtable (tabla "Fichas"), regenera
   js/data.js con lo que esté marcado como "Disponible"
   o "Reservado" (las "Vendido" se excluyen del catálogo
   público pero quedan intactas en Airtable), descarga
   fotos/video nuevos a images/listings/<id>/, y corre
   build-pages.js para regenerar el sitio.

   Variables de entorno requeridas:
     AIRTABLE_TOKEN     Personal Access Token
     AIRTABLE_BASE_ID   ID de la base (empieza con "app")
     AIRTABLE_TABLE     Nombre de la tabla (default: "Fichas")

   Uso:
     node scripts/sync-airtable.js            # sincroniza y regenera el sitio
     node scripts/sync-airtable.js --no-build # solo regenera js/data.js
   ============================================ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_TABLE || "Fichas";
const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images", "listings");
const DATA_FILE = path.join(ROOT, "js", "data.js");
const RUN_BUILD = !process.argv.includes("--no-build");

if (!TOKEN || !BASE_ID) {
  console.error("Faltan AIRTABLE_TOKEN y/o AIRTABLE_BASE_ID como variables de entorno.");
  process.exit(1);
}

async function fetchAllRecords() {
  const records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) {
      throw new Error(`Airtable respondió ${res.status}: ${await res.text()}`);
    }
    const json = await res.json();
    records.push(...json.records);
    offset = json.offset;
  } while (offset);
  return records;
}

function slugFolder(id) {
  return id.replace(/^(prop|veh)-/, "");
}

async function downloadIfMissing(url, destPath) {
  if (fs.existsSync(destPath)) return;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  console.log(`  descargado: ${path.relative(ROOT, destPath)}`);
}

function summarize(description, max = 150) {
  if (!description) return "";
  if (description.length <= max) return description;
  const cut = description.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 0 ? lastSpace : max) + "…";
}

function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function specsFor(f) {
  const isProp = f["Tipo"] === "Propiedad";
  if (isProp) {
    return {
      habitaciones: f["Habitaciones"] || "—",
      banos: f["Baños"] || "—",
      areaConstruccion: f["Área construcción"] || "—",
      areaTerreno: f["Área terreno"] || "—",
      parqueos: f["Parqueos"] || "—",
    };
  }
  return {
    anio: f["Año"] || "—",
    kilometraje: f["Kilometraje"] || "—",
    transmision: f["Transmisión"] || "—",
    combustible: f["Combustible"] || "—",
    motor: f["Motor"] || "—",
  };
}

async function recordToListing(record) {
  const f = record.fields;
  const id = f["ID"];
  if (!id) {
    console.warn(`  ⚠️  fila sin ID (record ${record.id}), se omite`);
    return null;
  }
  const folder = slugFolder(id);
  const localImages = [];

  const fotos = f["Fotos"] || [];
  for (let i = 0; i < fotos.length; i++) {
    const ext = path.extname(fotos[i].filename || ".jpg") || ".jpg";
    const destName = `${String(i + 1).padStart(2, "0")}${ext}`;
    const destPath = path.join(IMAGES_DIR, folder, destName);
    await downloadIfMissing(fotos[i].url, destPath);
    localImages.push(`images/listings/${folder}/${destName}`);
  }

  let video = null;
  const videoAttachment = f["Video archivo"] && f["Video archivo"][0];
  if (videoAttachment) {
    const ext = path.extname(videoAttachment.filename || ".mp4") || ".mp4";
    const destPath = path.join(IMAGES_DIR, folder, `video${ext}`);
    await downloadIfMissing(videoAttachment.url, destPath);
    video = `images/listings/${folder}/video${ext}`;
  } else if (f["Video link"]) {
    video = f["Video link"];
  }

  const description = f["Descripción"] || "";
  const features = (f["Características"] || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id,
    type: f["Tipo"] === "Propiedad" ? "propiedad" : "vehiculo",
    title: f["Título"] || "",
    price: Number(f["Precio"]) || 0,
    location: f["Ubicación"] || "",
    badges: f["Badges"] && f["Badges"].length ? f["Badges"] : null,
    operacion: f["Operación"] || "Venta",
    summary: summarize(description),
    description,
    specs: specsFor(f),
    features,
    images: localImages,
    video,
  };
}

function listingToJs(l) {
  const lines = [];
  lines.push("  {");
  lines.push(`    id: "${esc(l.id)}",`);
  lines.push(`    type: "${esc(l.type)}",`);
  lines.push(`    title: "${esc(l.title)}",`);
  lines.push(`    price: ${l.price},`);
  lines.push(`    location: "${esc(l.location)}",`);
  if (l.badges) lines.push(`    badges: [${l.badges.map((b) => `"${esc(b)}"`).join(", ")}],`);
  lines.push(`    operacion: "${esc(l.operacion)}",`);
  lines.push(`    summary: "${esc(l.summary)}",`);
  lines.push(`    description:\n      "${esc(l.description)}",`);
  const specsEntries = Object.entries(l.specs)
    .map(([k, v]) => `      ${k}: ${typeof v === "number" ? v : `"${esc(v)}"`},`)
    .join("\n");
  lines.push(`    specs: {\n${specsEntries}\n    },`);
  lines.push(`    features: [${l.features.map((x) => `"${esc(x)}"`).join(", ")}],`);
  lines.push(`    images: [${l.images.map((x) => `"${esc(x)}"`).join(", ")}],`);
  if (l.video) lines.push(`    video: "${esc(l.video)}",`);
  lines.push("  },");
  return lines.join("\n");
}

async function main() {
  console.log(`Leyendo tabla "${TABLE}" de Airtable...`);
  const records = await fetchAllRecords();
  console.log(`${records.length} filas encontradas.`);

  const listings = [];
  for (const record of records) {
    const estado = record.fields["Estado"] || "Disponible";
    if (estado === "Vendido") continue;
    console.log(`Procesando ${record.fields["ID"] || record.id}...`);
    const listing = await recordToListing(record);
    if (listing) listings.push(listing);
  }

  const propiedades = listings.filter((l) => l.type === "propiedad");
  const vehiculos = listings.filter((l) => l.type === "vehiculo");

  const header = fs.readFileSync(DATA_FILE, "utf8").split("const listings = [")[0];
  const body = [
    "const listings = [",
    "  // ---------------- PROPIEDADES ----------------",
    propiedades.map(listingToJs).join("\n"),
    "  // ---------------- VEHÍCULOS ----------------",
    vehiculos.map(listingToJs).join("\n"),
    "];",
    "",
  ].join("\n");

  fs.writeFileSync(DATA_FILE, header + body);
  console.log(`\njs/data.js regenerado: ${propiedades.length} propiedades, ${vehiculos.length} vehículos.`);

  if (RUN_BUILD) {
    console.log("\nCorriendo build-pages.js...");
    execSync("node scripts/build-pages.js", { cwd: ROOT, stdio: "inherit" });
  }
}

main().catch((err) => {
  console.error("Error en la sincronización:", err.message);
  process.exit(1);
});
