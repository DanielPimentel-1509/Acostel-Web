/* ============================================
   PIMTEL — Lógica de la página de ficha (detalle)
   ============================================ */

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

function specsGridHtml(listing) {
  const labels = listing.type === "propiedad" ? PROPIEDAD_SPEC_LABELS : VEHICULO_SPEC_LABELS;
  return Object.entries(labels)
    .map(([key, label]) => {
      const value = listing.specs[key];
      if (value === undefined) return "";
      return `
        <div class="spec">
          <strong>${label}</strong>
          <span>${value}</span>
        </div>
      `;
    })
    .join("");
}

function galleryHtml(listing) {
  const images = listing.images && listing.images.length
    ? listing.images
    : [listing.type === "propiedad" ? "images/site/placeholder-propiedad.svg" : "images/site/placeholder-vehiculo.svg"];

  const thumbs = images
    .map(
      (src, i) => `
        <button data-index="${i}" class="${i === 0 ? "is-active" : ""}" aria-label="Foto ${i + 1}">
          <img src="${src}" alt="${listing.title} - foto ${i + 1}">
        </button>
      `
    )
    .join("");

  return `
    <div class="gallery-main">
      <img id="gallery-main-img" src="${images[0]}" alt="${listing.title}">
    </div>
    ${images.length > 1 ? `<div class="gallery-thumbs">${thumbs}</div>` : ""}
  `;
}

function videoSectionHtml(listing) {
  if (!listing.video) return "";

  if (isVideoFile(listing.video)) {
    return `
      <div class="detail-section">
        <h2>Video</h2>
        <video controls playsinline class="detail-video" src="${listing.video}"></video>
      </div>
    `;
  }

  const ytId = getYouTubeId(listing.video);
  if (!ytId) return "";
  return `
    <div class="detail-section">
      <h2>Video</h2>
      <div class="video-embed">
        <iframe src="https://www.youtube.com/embed/${ytId}" title="Video de ${listing.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

function renderNotFound() {
  const root = document.querySelector("#detail-root .container");
  root.innerHTML = `
    <div class="not-found">
      <h1>No encontramos esta ficha</h1>
      <p>Es posible que el enlace esté incompleto o que la publicación ya no esté disponible.</p>
      <a href="index.html" class="btn btn-primary">Volver al catálogo</a>
    </div>
  `;
}

function renderListing(listing) {
  document.title = `${listing.title} | Pimtel`;

  const metaDescription = document.getElementById("meta-description");
  const summaryText = `${listing.summary} ${formatPrice(listing)} — ${listing.location}, El Salvador.`;
  if (metaDescription) metaDescription.setAttribute("content", summaryText);

  const ogTitle = document.getElementById("og-title");
  if (ogTitle) ogTitle.setAttribute("content", `${listing.title} | Pimtel`);
  const ogDescription = document.getElementById("og-description");
  if (ogDescription) ogDescription.setAttribute("content", summaryText);
  const ogImage = document.getElementById("og-image");
  if (ogImage && listing.images && listing.images[0]) {
    ogImage.setAttribute("content", `https://acostel.netlify.app/${listing.images[0]}`);
  }
  const ogUrl = document.getElementById("og-url");
  if (ogUrl) ogUrl.setAttribute("content", `https://acostel.netlify.app/ficha.html?id=${listing.id}`);

  const breadcrumbType = document.getElementById("breadcrumb-type");
  const breadcrumbTitle = document.getElementById("breadcrumb-title");
  if (breadcrumbType) {
    breadcrumbType.innerHTML = `<a href="index.html?tipo=${listing.type}#catalogo">${listing.type === "propiedad" ? "Propiedades" : "Vehículos"}</a>`;
  }
  if (breadcrumbTitle) breadcrumbTitle.textContent = listing.title;

  const root = document.querySelector("#detail-root .container");
  const whatsappMessage = `Hola, estoy interesado/a en "${listing.title}" (ref. ${listing.id}). ¿Me podrían dar más información?`;

  root.innerHTML = `
    <div class="detail-grid">
      <div class="detail-gallery">
        ${galleryHtml(listing)}
      </div>
      <div class="detail-info">
        ${listing.badge ? `<span class="card-badge">${listing.badge}</span>` : ""}
        <span class="card-type">${listing.type === "propiedad" ? "Propiedad" : "Vehículo"}${listing.operacion ? " · " + listing.operacion : ""}</span>
        <h1>${listing.title}</h1>
        <div class="detail-location">${listing.location}</div>
        <div class="detail-price">${formatPrice(listing)}</div>
        <div class="detail-specs">${specsGridHtml(listing)}</div>
        <div class="detail-cta">
          <a href="${buildWhatsAppLink(whatsappMessage)}" target="_blank" rel="noopener" class="btn btn-whatsapp">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.36 4 15c0 2.36.7 4.56 1.9 6.4L4 29l7.8-1.86A11.94 11.94 0 0 0 16.04 27C22.68 27 28 21.64 28 15S22.68 3 16.04 3Zm0 21.7c-2 0-3.86-.55-5.46-1.5l-.39-.23-4.63 1.1 1.13-4.5-.25-.4A9.65 9.65 0 0 1 6.3 15c0-5.36 4.4-9.7 9.74-9.7 5.35 0 9.74 4.34 9.74 9.7 0 5.36-4.39 9.7-9.74 9.7Zm5.34-7.26c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-1.99-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.2-.55-.35Z"/></svg>
            Consultar por WhatsApp
          </a>
          <a href="index.html?ref=${listing.id}#contacto" class="form-link">o completa el formulario de contacto</a>
          ${listing.type === "propiedad" ? '<span class="ref">Las visitas se coordinan con al menos 1 día de anticipación.</span>' : ""}
          <span class="ref">Referencia: ${listing.id}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h2>Descripción</h2>
      <p>${listing.description}</p>
    </div>

    ${videoSectionHtml(listing)}

    ${listing.features && listing.features.length ? `
      <div class="detail-section">
        <h2>Características</h2>
        <ul class="features-list">
          ${listing.features.map((f) => `<li>${f}</li>`).join("")}
        </ul>
      </div>
    ` : ""}
  `;

  const thumbButtons = root.querySelectorAll(".gallery-thumbs button");
  const mainImg = document.getElementById("gallery-main-img");
  thumbButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      mainImg.src = listing.images[idx];
      thumbButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });
}

function initDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    renderNotFound();
    return;
  }

  // Los enlaces antiguos (ficha.html?id=X) redirigen a la página
  // estática canónica (/p/X/), mejor para SEO y vistas previas.
  window.location.replace(`p/${listing.id}/`);
}

document.addEventListener("DOMContentLoaded", initDetailPage);
