/* ============================================
   PIMTEL — Generador de páginas estáticas por ficha
   --------------------------------------------
   Lee js/data.js y genera una página HTML real por cada listado en
   p/<id>/index.html, con todo el contenido escrito directamente en el
   HTML (no armado por JavaScript). Esto permite:
   - Que Google indexe cada propiedad/vehículo como una página propia.
   - Que las vistas previas de WhatsApp/Facebook muestren la foto,
     título y precio reales de cada ficha.

   Regenerar tras cambiar js/data.js:  node scripts/build-pages.js
   ============================================ */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SITE_URL = "https://pimtel.netlify.app";

const listings = new Function(
  fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8") + "; return listings;"
)();

const WHATSAPP_NUMBER = "50361968521";

// Versiona el CSS/JS con un hash de su contenido en la URL (?v=...) para
// que el navegador (o el caché de WhatsApp/Instagram, que a veces ignora
// Cache-Control) nunca sirva una copia vieja después de un cambio: al
// cambiar el archivo, cambia la URL, así que no hay nada que revalidar.
const ASSET_VERSION = crypto
  .createHash("sha1")
  .update(
    Buffer.concat(
      ["css/styles.css", "js/data.js", "js/common.js", "js/main.js", "js/detail.js"].map((f) =>
        fs.readFileSync(path.join(ROOT, f))
      )
    )
  )
  .digest("hex")
  .slice(0, 10);

// Reescribe los <link>/<script> de un archivo HTML fuente (no generado)
// para que apunten a la versión actual de css/styles.css y de cada js/*.js.
function stampAssetVersion(relPath) {
  const filePath = path.join(ROOT, relPath);
  let html = fs.readFileSync(filePath, "utf8");
  html = html.replace(
    /(href="\/?css\/styles\.css)(\?v=[^"]*)?(")/g,
    `$1?v=${ASSET_VERSION}$3`
  );
  html = html.replace(
    /(src="\/?js\/(?:data|common|main|detail)\.js)(\?v=[^"]*)?(")/g,
    `$1?v=${ASSET_VERSION}$3`
  );
  fs.writeFileSync(filePath, html);
}

const PROPIEDAD_SPEC_LABELS = {
  habitaciones: "Habitaciones",
  banos: "Baños",
  areaConstruccion: "Área de construcción",
  areaTerreno: "Área de terreno",
  parqueos: "Parqueos",
};
const VEHICULO_SPEC_LABELS = {
  anio: "Año",
  kilometraje: "Kilometraje",
  transmision: "Transmisión",
  combustible: "Combustible",
  motor: "Motor",
};

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPrice(listing) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.price);
  if (listing.type === "propiedad" && listing.operacion === "Renta") {
    return `${formatted}/mes`;
  }
  return formatted;
}

function isVideoFile(url) {
  return !!url && /\.(mp4|webm|mov)$/i.test(url);
}
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function absUrl(rel) {
  return `${SITE_URL}/${rel.replace(/^\//, "")}`;
}

function truncateAtWord(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\s]+$/, "");
}

// Google recorta las meta descriptions a ~155-160 caracteres. Muchos "summary"
// del catálogo son más largos que eso, así que se arma la versión completa
// (resumen + precio + ubicación) y, si no cabe, se recorta de forma prolija:
// primero probando quedarse solo con las oraciones completas que sí caben,
// y si ni la primera oración cabe, se corta en el último espacio con "…".
function metaDescription(listing, maxLen = 158) {
  const suffix = ` ${formatPrice(listing)} — ${listing.location}, El Salvador.`;
  const budget = maxLen - suffix.length;
  const cleaned = listing.summary.trim().replace(/[.\s…]*$/, "");

  if (cleaned.length <= budget) {
    return `${cleaned}.${suffix}`;
  }

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  let acc = "";
  for (const sentence of sentences) {
    const candidate = acc ? `${acc} ${sentence}` : sentence;
    if (candidate.length <= budget) {
      acc = candidate;
    } else {
      break;
    }
  }
  if (acc.length >= 40) {
    if (!/[.!?]$/.test(acc)) acc += ".";
    return `${acc}${suffix}`;
  }

  return `${truncateAtWord(cleaned, budget)}…${suffix}`;
}

function specsGridHtml(listing) {
  const labels = listing.type === "propiedad" ? PROPIEDAD_SPEC_LABELS : VEHICULO_SPEC_LABELS;
  return Object.entries(labels)
    .map(([key, label]) => {
      const value = listing.specs[key];
      if (value === undefined) return "";
      return `<div class="spec"><strong>${esc(label)}</strong><span>${esc(value)}</span></div>`;
    })
    .join("");
}

function galleryHtml(listing) {
  const images = listing.images && listing.images.length
    ? listing.images
    : [listing.type === "propiedad" ? "images/site/placeholder-propiedad.svg" : "images/site/placeholder-vehiculo.svg"];
  const thumbs = images
    .map(
      (src, i) =>
        `<button data-src="/${esc(src)}" class="${i === 0 ? "is-active" : ""}" aria-label="Foto ${i + 1}"><img src="/${esc(src)}" alt="${esc(listing.title)} - foto ${i + 1}" loading="lazy"></button>`
    )
    .join("");
  return `
    <div class="gallery-main">
      <img id="gallery-main-img" src="/${esc(images[0])}" alt="${esc(listing.title)}">
    </div>
    ${images.length > 1 ? `<div class="gallery-thumbs">${thumbs}</div>` : ""}
  `;
}

function videoSectionHtml(listing) {
  if (!listing.video) return "";
  if (isVideoFile(listing.video)) {
    return `<div class="detail-section"><h2>Video</h2><video controls playsinline class="detail-video" src="/${esc(listing.video)}"></video></div>`;
  }
  const ytId = getYouTubeId(listing.video);
  if (!ytId) return "";
  return `<div class="detail-section"><h2>Video</h2><div class="video-embed"><iframe src="https://www.youtube.com/embed/${ytId}" title="Video de ${esc(listing.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
}

const WA_SVG = '<svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.36 4 15c0 2.36.7 4.56 1.9 6.4L4 29l7.8-1.86A11.94 11.94 0 0 0 16.04 27C22.68 27 28 21.64 28 15S22.68 3 16.04 3Zm0 21.7c-2 0-3.86-.55-5.46-1.5l-.39-.23-4.63 1.1 1.13-4.5-.25-.4A9.65 9.65 0 0 1 6.3 15c0-5.36 4.4-9.7 9.74-9.7 5.35 0 9.74 4.34 9.74 9.7 0 5.36-4.39 9.7-9.74 9.7Zm5.34-7.26c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-1.99-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.2-.55-.35Z"/></svg>';

function jsonLd(listing) {
  const images = (listing.images && listing.images.length ? listing.images : []).map((i) => absUrl(i));
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.summary,
    image: images.length ? images : undefined,
    category: listing.type === "propiedad" ? "Bienes raíces" : "Vehículos",
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      areaServed: { "@type": "Country", name: "El Salvador" },
      seller: { "@type": "RealEstateAgent", name: "Pimtel" },
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: listing.type === "propiedad" ? "Propiedades" : "Vehículos",
        item: `${SITE_URL}/index.html?tipo=${listing.type}`,
      },
      { "@type": "ListItem", position: 3, name: listing.title },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>\n<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
}

function pageHtml(listing) {
  const pageUrl = `${SITE_URL}/p/${listing.id}/`;
  const summaryText = metaDescription(listing);
  const hasRealPhoto = !!(listing.images && listing.images[0]);
  const cover = hasRealPhoto ? absUrl(listing.images[0]) : absUrl("images/site/og-banner.jpg");
  const whatsappMessage = `Hola, estoy interesado/a en "${listing.title}" (ref. ${listing.id}). ¿Me podrían dar más información?`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
  const typeLabel = listing.type === "propiedad" ? "Propiedad" : "Vehículo";
  const typePlural = listing.type === "propiedad" ? "Propiedades" : "Vehículos";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(listing.title)} | Pimtel</title>
<meta name="description" content="${esc(summaryText)}">
<link rel="canonical" href="${pageUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pimtel">
<meta property="og:title" content="${esc(listing.title)} | Pimtel">
<meta property="og:description" content="${esc(summaryText)}">
<meta property="og:image" content="${esc(cover)}">
${!hasRealPhoto ? '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' : ""}<meta property="og:url" content="${pageUrl}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/site/favicon-icon.png" type="image/png">
<link rel="apple-touch-icon" href="/images/site/favicon-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css?v=${ASSET_VERSION}">
${jsonLd(listing)}
</head>
<body>

<header class="site-header">
  <div class="container">
    <a href="/index.html" class="logo">
      <span class="brand-wordmark">PIMT<span class="e">E</span>L</span>
      <img src="/images/site/logo-icon.png" alt="" class="brand-icon">
      <span class="logo-tagline">Bienes Raíces &amp; Vehículos</span>
    </a>
    <nav class="main-nav">
      <ul>
        <li><a href="/index.html">Inicio</a></li>
        <li><a href="/index.html?tipo=propiedad#catalogo">Propiedades</a></li>
        <li><a href="/index.html?tipo=vehiculo#catalogo">Vehículos</a></li>
        <li><a href="/index.html#nosotros">Nosotros</a></li>
        <li><a href="/index.html#vender">Vender</a></li>
        <li><a href="/index.html#contacto">Contacto</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <a href="/index.html#contacto" class="btn btn-whatsapp">${WA_SVG} Contáctanos</a>
    </div>
    <button class="nav-toggle" aria-label="Abrir menú"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="container breadcrumb">
  <a href="/index.html">Inicio</a> / <a href="/index.html?tipo=${listing.type}#catalogo">${typePlural}</a> / <span>${esc(listing.title)}</span>
</div>

<main id="detail-root" class="detail">
  <div class="container">
    <div class="detail-grid">
      <div class="detail-gallery">
        ${galleryHtml(listing)}
      </div>
      <div class="detail-info">
        ${listing.badge ? `<span class="card-badge">${esc(listing.badge)}</span>` : ""}
        <span class="card-type">${typeLabel}${listing.operacion ? " · " + esc(listing.operacion) : ""}</span>
        <h1>${esc(listing.title)}</h1>
        <div class="detail-location">${esc(listing.location)}</div>
        <div class="detail-price">${formatPrice(listing)}</div>
        <div class="detail-specs">${specsGridHtml(listing)}</div>
        <div class="detail-cta">
          <a href="${esc(waLink)}" target="_blank" rel="noopener" class="btn btn-whatsapp">${WA_SVG} Consultar por WhatsApp</a>
          <a href="/index.html?ref=${listing.id}#contacto" class="form-link">o completa el formulario de contacto</a>
          ${listing.type === "propiedad" ? '<span class="ref">Las visitas se coordinan con al menos 1 día de anticipación.</span>' : ""}
          <span class="ref">Referencia: ${esc(listing.id)}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h2>Descripción</h2>
      <p>${esc(listing.description)}</p>
    </div>

    ${videoSectionHtml(listing)}

    ${listing.features && listing.features.length ? `
      <div class="detail-section">
        <h2>Características</h2>
        <ul class="features-list">
          ${listing.features.map((f) => `<li>${esc(f)}</li>`).join("")}
        </ul>
      </div>
    ` : ""}
  </div>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo-row">
          <span class="brand-wordmark on-dark">PIMT<span class="e">E</span>L</span>
          <img src="/images/site/logo-icon.png" alt="" class="brand-icon">
        </div>
        <p>Bienes raíces y vehículos en venta en todo El Salvador.</p>
      </div>
      <div class="footer-col">
        <h4>Enlaces</h4>
        <ul>
          <li><a href="/index.html?tipo=propiedad#catalogo">Propiedades</a></li>
          <li><a href="/index.html?tipo=vehiculo#catalogo">Vehículos</a></li>
          <li><a href="/index.html#nosotros">Nosotros</a></li>
          <li><a href="/index.html#vender">Vender</a></li>
          <li><a href="/index.html#contacto">Contacto</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contacto</h4>
        <ul>
          <li><a href="#" id="footer-whatsapp-link">WhatsApp</a></li>
          <li><a href="tel:+50361968521">+503 6196 8521</a></li>
          <li><a href="mailto:bienesyraicesacsotel@gmail.com">bienesyraicesacsotel@gmail.com</a></li>
          <li><span>El Salvador</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span id="year"></span> Pimtel. Todos los derechos reservados.</span>
      <span>Sitio construido con Claude Code</span>
    </div>
  </div>
</footer>

<a id="whatsapp-float" class="whatsapp-float" href="${esc(waLink)}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
  <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.36 4 15c0 2.36.7 4.56 1.9 6.4L4 29l7.8-1.86A11.94 11.94 0 0 0 16.04 27C22.68 27 28 21.64 28 15S22.68 3 16.04 3Zm0 21.7c-2 0-3.86-.55-5.46-1.5l-.39-.23-4.63 1.1 1.13-4.5-.25-.4A9.65 9.65 0 0 1 6.3 15c0-5.36 4.4-9.7 9.74-9.7 5.35 0 9.74 4.34 9.74 9.7 0 5.36-4.39 9.7-9.74 9.7Zm5.34-7.26c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-1.99-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.2-.55-.35Z"/></svg>
</a>

<script>
  document.getElementById("year").textContent = new Date().getFullYear();
  (function () {
    var main = document.getElementById("gallery-main-img");
    document.querySelectorAll(".gallery-thumbs button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        main.src = btn.getAttribute("data-src");
        document.querySelectorAll(".gallery-thumbs button").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
    });
  })();
</script>
</body>
</html>
`;
}

// --- Escribir páginas ---
let count = 0;
for (const listing of listings) {
  const dir = path.join(ROOT, "p", listing.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), pageHtml(listing));
  count++;
}

// --- Regenerar sitemap.xml ---
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE_URL}/`, priority: "1.0" },
  { loc: `${SITE_URL}/index.html?tipo=propiedad`, priority: "0.8" },
  { loc: `${SITE_URL}/index.html?tipo=vehiculo`, priority: "0.8" },
  ...listings.map((l) => ({ loc: `${SITE_URL}/p/${l.id}/`, priority: "0.7" })),
];
const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);

// --- Versionar CSS/JS en las páginas fuente (no generadas) ---
["index.html", "ficha.html", "gracias.html"].forEach(stampAssetVersion);

console.log(`Generadas ${count} páginas estáticas en p/<id>/index.html`);
console.log(`Sitemap regenerado con ${urls.length} URLs`);
console.log(`Assets versionados con ?v=${ASSET_VERSION}`);
