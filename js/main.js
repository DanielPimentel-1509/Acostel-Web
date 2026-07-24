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

function sidebarItemHtml(listing) {
  const cover = listing.images && listing.images[0]
    ? listing.images[0]
    : listing.type === "propiedad"
      ? "images/site/placeholder-propiedad.svg"
      : "images/site/placeholder-vehiculo.svg";

  return `
    <a href="p/${encodeURIComponent(listing.id)}/" class="sidebar-item">
      <img src="${cover}" alt="${listing.title}" loading="lazy">
      <div class="sidebar-item-info">
        <span class="sidebar-item-title">${listing.title}</span>
        <span class="sidebar-item-price">${formatPrice(listing)}</span>
      </div>
    </a>
  `;
}

function renderSidebar(type) {
  const list = document.getElementById("sidebar-list");
  if (!list) return;

  const items = listings.filter((item) => item.type === type).slice(0, 4);
  list.innerHTML = items.length
    ? items.map(sidebarItemHtml).join("")
    : `<p class="sidebar-empty">Próximamente.</p>`;
}

function updateCatalogLabels(primaryType, secondaryType) {
  const label = (type) => (type === "propiedad" ? "Propiedades disponibles" : "Vehículos disponibles");
  const titleEl = document.getElementById("catalog-title");
  const sidebarTitleEl = document.getElementById("sidebar-title");
  const viewAllEl = document.getElementById("sidebar-viewall");

  if (titleEl) titleEl.textContent = label(primaryType);
  if (sidebarTitleEl) sidebarTitleEl.textContent = label(secondaryType);
  if (viewAllEl) {
    viewAllEl.textContent = secondaryType === "propiedad" ? "Ver todas las propiedades →" : "Ver todos los vehículos →";
    viewAllEl.href = `index.html?tipo=${secondaryType}#catalogo`;
  }
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

const catalogState = { type: "propiedad" };

function switchCatalogType(type) {
  if (catalogState.type === type) return;
  catalogState.type = type;
  const secondaryType = type === "propiedad" ? "vehiculo" : "propiedad";

  document.getElementById("filter-location").value = "";
  document.getElementById("filter-price-min").value = "";
  document.getElementById("filter-price-max").value = "";

  updateCatalogLabels(type, secondaryType);
  populateLocationFilter(type);
  renderCatalog(type);
  renderSidebar(secondaryType);

  const url = new URL(window.location.href);
  url.searchParams.set("tipo", type);
  url.hash = "catalogo";
  window.history.replaceState({}, "", url);
}

function initCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  catalogState.type = params.get("tipo") === "vehiculo" ? "vehiculo" : "propiedad";
  const secondaryType = catalogState.type === "propiedad" ? "vehiculo" : "propiedad";

  updateCatalogLabels(catalogState.type, secondaryType);
  populateLocationFilter(catalogState.type);
  renderCatalog(catalogState.type);
  renderSidebar(secondaryType);

  const locationEl = document.getElementById("filter-location");
  const minEl = document.getElementById("filter-price-min");
  const maxEl = document.getElementById("filter-price-max");
  const clearBtn = document.getElementById("filter-clear");

  locationEl.addEventListener("change", () => renderCatalog(catalogState.type));
  minEl.addEventListener("input", () => renderCatalog(catalogState.type));
  maxEl.addEventListener("input", () => renderCatalog(catalogState.type));
  clearBtn.addEventListener("click", () => {
    locationEl.value = "";
    minEl.value = "";
    maxEl.value = "";
    renderCatalog(catalogState.type);
  });
}

const VIEW_TRANSITION_MS = 220;
const INICIO_ANCHORS = ["nosotros", "contacto"];

function setActiveView(key, { animate = true } = {}) {
  const views = Array.from(document.querySelectorAll(".view[data-view]"));
  const current = views.find((v) => v.classList.contains("is-active"));
  const next = views.find((v) => v.dataset.view === key);
  if (!next || next === current) return false;

  function activate() {
    views.forEach((v) => v.classList.remove("is-active", "is-fading"));
    next.classList.add("is-active", "is-fading");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => next.classList.remove("is-fading"));
    });
  }

  if (!animate || !current) {
    activate();
    return true;
  }

  current.classList.add("is-fading");
  setTimeout(activate, VIEW_TRANSITION_MS);
  return true;
}

function setActiveNavLink(key) {
  document.querySelectorAll(".main-nav a[data-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === key);
  });
}

function viewTargetFromUrl(url) {
  const tipo = url.searchParams.get("tipo");
  if (tipo === "propiedad" || tipo === "vehiculo") return { view: "catalogo", nav: tipo, tipo };
  const hashKey = url.hash ? url.hash.slice(1) : "";
  if (hashKey === "vender") return { view: "vender", nav: "vender" };
  if (INICIO_ANCHORS.includes(hashKey)) return { view: "inicio", nav: hashKey, anchor: hashKey };
  return { view: "inicio", nav: "inicio" };
}

function featuredCards(type, count) {
  return listings
    .filter((item) => item.type === type)
    .sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0))
    .slice(0, count);
}

function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  const items = [...featuredCards("propiedad", 4), ...featuredCards("vehiculo", 2)];
  grid.innerHTML = items.map(cardHtml).join("");
  attachVideoPreviews(grid);
}

function initViews() {
  const views = document.querySelectorAll(".view[data-view]");
  if (!views.length) return;
  document.body.classList.add("js-views");

  let suppressSpyUntil = 0;

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='index.html']");
    if (!link) return;

    const url = new URL(link.getAttribute("href"), window.location.href);
    const { view, nav, tipo, anchor } = viewTargetFromUrl(url);

    e.preventDefault();
    if (tipo) switchCatalogType(tipo);
    const switched = setActiveView(view);
    setActiveNavLink(nav);
    suppressSpyUntil = Date.now() + (switched ? VIEW_TRANSITION_MS : 0) + 900;

    if (anchor) {
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, switched ? VIEW_TRANSITION_MS : 0);
    }

    const newPath = tipo
      ? `index.html?tipo=${tipo}#catalogo`
      : nav === "inicio" ? "index.html" : `index.html#${nav}`;
    window.history.replaceState({}, "", newPath);
  });

  const initial = viewTargetFromUrl(new URL(window.location.href));
  if (initial.tipo) catalogState.type = initial.tipo;
  setActiveView(initial.view, { animate: false });
  setActiveNavLink(initial.nav);
  if (initial.anchor) {
    document.getElementById(initial.anchor)?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  const spyTargets = [
    { el: document.querySelector(".hero"), nav: "inicio" },
    { el: document.getElementById("nosotros"), nav: "nosotros" },
    { el: document.getElementById("contacto"), nav: "contacto" },
  ].filter((t) => t.el);

  const observer = new IntersectionObserver(
    (entries) => {
      if (Date.now() < suppressSpyUntil) return;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = spyTargets.find((t) => t.el === entry.target);
        if (target) setActiveNavLink(target.nav);
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  spyTargets.forEach((t) => observer.observe(t.el));
}

document.addEventListener("DOMContentLoaded", () => {
  initStatsCount();
  initCatalog();
  renderFeatured();
  initViews();
});
