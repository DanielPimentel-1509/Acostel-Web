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
      <a href="p/${encodeURIComponent(listing.id)}/" class="card-link">
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

function populateLocationFilter(type) {
  const select = document.getElementById("filter-location");
  const wrap = document.getElementById("filter-location-wrap");
  if (!select) return;

  if (type === "vehiculo") {
    wrap.style.display = "none";
    select.value = "";
    return;
  }
  wrap.style.display = "";

  const locations = Array.from(
    new Set(listings.filter((item) => item.type === type).map((item) => item.location))
  ).sort((a, b) => a.localeCompare(b, "es"));

  const current = select.value;
  select.innerHTML = '<option value="">Todas las ubicaciones</option>' +
    locations.map((loc) => `<option value="${loc}">${loc}</option>`).join("");
  if (locations.includes(current)) select.value = current;
}

function getActiveFilters() {
  const locationEl = document.getElementById("filter-location");
  const minEl = document.getElementById("filter-price-min");
  const maxEl = document.getElementById("filter-price-max");
  return {
    location: locationEl ? locationEl.value : "",
    priceMin: minEl && minEl.value !== "" ? Number(minEl.value) : null,
    priceMax: maxEl && maxEl.value !== "" ? Number(maxEl.value) : null,
  };
}

function renderCatalog(type) {
  const grid = document.getElementById("catalog-grid");
  const count = document.getElementById("catalog-count");
  if (!grid) return;

  const { location, priceMin, priceMax } = getActiveFilters();

  const filtered = listings.filter((item) => {
    if (item.type !== type) return false;
    if (location && item.location !== location) return false;
    if (priceMin !== null && item.price < priceMin) return false;
    if (priceMax !== null && item.price > priceMax) return false;
    return true;
  });

  const label = type === "propiedad" ? "propiedades" : "vehículos";
  grid.innerHTML = filtered.length
    ? filtered.map(cardHtml).join("")
    : `<p class="catalog-empty">No encontramos ${label} con esos filtros. Prueba ajustando la búsqueda.</p>`;

  if (count) {
    count.textContent = `${filtered.length} ${label} disponibles`;
  }

  attachVideoPreviews(grid);
}

function setActiveTab(type) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.type === type);
  });
}

function initStatsCount() {
  const el = document.getElementById("stat-listings-count");
  if (el) el.textContent = `${listings.length}+`;

  const yearsEl = document.getElementById("stat-years");
  if (yearsEl) {
    // 10 de octubre de 2020: cuando Daniel cumplió 14 años y vendió su
    // primera casa. El número sube solo cada 10 de octubre (su cumpleaños).
    const founding = new Date(2020, 9, 10);
    const now = new Date();
    let years = now.getFullYear() - founding.getFullYear();
    const anniversaryThisYear = new Date(now.getFullYear(), 9, 10);
    if (now < anniversaryThisYear) years -= 1;
    yearsEl.textContent = `${years}+`;
  }
}

function initCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  let currentType = params.get("tipo") === "vehiculo" ? "vehiculo" : "propiedad";

  setActiveTab(currentType);
  populateLocationFilter(currentType);
  renderCatalog(currentType);

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type;
      setActiveTab(currentType);
      document.getElementById("filter-price-min").value = "";
      document.getElementById("filter-price-max").value = "";
      populateLocationFilter(currentType);
      renderCatalog(currentType);
      const url = new URL(window.location.href);
      url.searchParams.set("tipo", currentType);
      window.history.replaceState({}, "", url);
    });
  });

  const locationEl = document.getElementById("filter-location");
  const minEl = document.getElementById("filter-price-min");
  const maxEl = document.getElementById("filter-price-max");
  const clearBtn = document.getElementById("filter-clear");

  locationEl.addEventListener("change", () => renderCatalog(currentType));
  minEl.addEventListener("input", () => renderCatalog(currentType));
  maxEl.addEventListener("input", () => renderCatalog(currentType));
  clearBtn.addEventListener("click", () => {
    locationEl.value = "";
    minEl.value = "";
    maxEl.value = "";
    renderCatalog(currentType);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initStatsCount();
  initCatalog();
});
