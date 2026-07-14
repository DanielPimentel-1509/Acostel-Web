/* ============================================
   ACOSTEL — Lógica de la página de inicio
   (pestañas Propiedades / Vehículos + tarjetas)
   ============================================ */

function specsRowHtml(listing) {
  if (listing.type === "propiedad") {
    const { habitaciones, banos, areaConstruccion } = listing.specs;
    return `
      <span>${habitaciones} hab.</span>
      <span>${banos} baños</span>
      <span>${areaConstruccion}</span>
    `;
  }
  const { anio, kilometraje, transmision } = listing.specs;
  return `
    <span>${anio}</span>
    <span>${kilometraje}</span>
    <span>${transmision}</span>
  `;
}

function cardHtml(listing) {
  const cover = listing.images && listing.images[0]
    ? listing.images[0]
    : listing.type === "propiedad"
      ? "images/site/placeholder-propiedad.svg"
      : "images/site/placeholder-vehiculo.svg";

  return `
    <article class="card">
      <a href="ficha.html?id=${encodeURIComponent(listing.id)}" class="card-link">
        <div class="card-media"${listing.video ? ` data-video="${listing.video}"` : ""}>
          <img src="${cover}" alt="${listing.title}" loading="lazy">
          ${listing.badge ? `<span class="card-badge">${listing.badge}</span>` : ""}
          <span class="card-type">${listing.type === "propiedad" ? "Propiedad" : "Vehículo"}</span>
          ${listing.video ? `<span class="card-play" aria-hidden="true">▶</span>` : ""}
        </div>
        <div class="card-body">
          <span class="card-price">${formatPrice(listing)}</span>
          <span class="card-title">${listing.title}</span>
          <span class="card-location">${listing.location}</span>
          <div class="card-specs">${specsRowHtml(listing)}</div>
          <span class="card-cta">Ver detalle →</span>
        </div>
      </a>
    </article>
  `;
}

function buildVideoPreviewElement(videoUrl) {
  if (isVideoFile(videoUrl)) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.className = "card-preview-video";
    return video;
  }
  const ytId = getYouTubeId(videoUrl);
  if (!ytId) return null;
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1`;
  iframe.className = "card-preview-video";
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allow", "autoplay; encrypted-media");
  return iframe;
}

function attachVideoPreviews(grid) {
  grid.querySelectorAll(".card-media[data-video]").forEach((media) => {
    const videoUrl = media.dataset.video;
    let previewEl = null;
    let pressTimer = null;

    const start = () => {
      if (previewEl) return;
      previewEl = buildVideoPreviewElement(videoUrl);
      if (!previewEl) return;
      media.appendChild(previewEl);
    };
    const stop = () => {
      clearTimeout(pressTimer);
      if (previewEl) {
        previewEl.remove();
        previewEl = null;
      }
    };

    media.addEventListener("mouseenter", start);
    media.addEventListener("mouseleave", stop);
    media.addEventListener(
      "touchstart",
      () => {
        pressTimer = setTimeout(start, 350);
      },
      { passive: true }
    );
    media.addEventListener("touchend", stop);
    media.addEventListener("touchcancel", stop);
  });
}

function renderCatalog(type) {
  const grid = document.getElementById("catalog-grid");
  const count = document.getElementById("catalog-count");
  if (!grid) return;

  const filtered = listings.filter((item) => item.type === type);

  grid.innerHTML = filtered.length
    ? filtered.map(cardHtml).join("")
    : `<p class="catalog-empty">Aún no hay ${type === "propiedad" ? "propiedades" : "vehículos"} publicados. Vuelve pronto.</p>`;

  if (count) {
    const label = type === "propiedad" ? "propiedades" : "vehículos";
    count.textContent = `${filtered.length} ${label} disponibles`;
  }

  attachVideoPreviews(grid);
}

function setActiveTab(type) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.type === type);
  });
}

function initCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const initialType = params.get("tipo") === "vehiculo" ? "vehiculo" : "propiedad";

  setActiveTab(initialType);
  renderCatalog(initialType);

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      setActiveTab(type);
      renderCatalog(type);
      const url = new URL(window.location.href);
      url.searchParams.set("tipo", type);
      window.history.replaceState({}, "", url);
    });
  });
}

document.addEventListener("DOMContentLoaded", initCatalog);
