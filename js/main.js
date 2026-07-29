/* ============================================
   PIMTEL — Lógica de la página de inicio
   (vistas por pantalla + catálogos + carrusel)
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

function coverImage(listing) {
  if (listing.images && listing.images[0]) return listing.images[0];
  return listing.type === "propiedad"
    ? "images/site/placeholder-propiedad.svg"
    : "images/site/placeholder-vehiculo.svg";
}

function cardHtml(listing) {
  const cover = coverImage(listing);
  return `
    <article class="card reveal">
      <a href="p/${encodeURIComponent(listing.id)}/" class="card-link">
        <div class="card-media"${listing.video ? ` data-video="${listing.video}"` : ""}>
          <img src="${cover}" alt="${listing.title}" loading="lazy">
          ${listing.badges && listing.badges.length ? `<div class="card-badges">${listing.badges.map((b) => `<span class="card-badge">${b}</span>`).join("")}</div>` : ""}
          <span class="card-type">${listing.type === "propiedad" ? "Propiedad" : "Vehículo"}</span>
          ${listing.video ? `<span class="card-play" aria-hidden="true">▶</span>` : ""}
        </div>
        <div class="card-body">
          <span class="card-price">${formatPrice(listing)}</span>
          <span class="card-title">${listing.title}</span>
          <span class="card-location">${listing.location}</span>
          <div class="card-specs">${specsRowHtml(listing)}</div>
          <span class="card-cta">Ver detalle <span class="arrow">→</span></span>
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
    media.addEventListener("touchstart", () => { pressTimer = setTimeout(start, 350); }, { passive: true });
    media.addEventListener("touchend", stop);
    media.addEventListener("touchcancel", stop);
  });
}

/* -------- Animación de aparición al entrar en pantalla --------
   Comprobación manual (no IntersectionObserver): revela cualquier
   elemento .reveal cuya parte superior ya entró en la ventana. Se
   ejecuta al cargar, al hacer scroll, al cambiar de tamaño y cada vez
   que se activa una vista. Es determinista: lo que ya está a la vista
   se revela de inmediato; lo de más abajo aparece al hacer scroll. */
let revealScheduled = false;

function revealInView(root) {
  const scope = root || document;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  scope.querySelectorAll(".reveal:not(.is-revealed)").forEach((el) => {
    const r = el.getBoundingClientRect();
    // Los elementos en una vista oculta (display:none) devuelven rect 0 y no se revelan.
    if (r.bottom > 0 && r.top < vh * 0.92) el.classList.add("is-revealed");
  });
}

function scheduleReveal() {
  if (revealScheduled) return;
  revealScheduled = true;
  requestAnimationFrame(() => {
    revealScheduled = false;
    revealInView(document);
  });
}

function initReveals() {
  revealInView(document);
  window.addEventListener("scroll", scheduleReveal, { passive: true });
  window.addEventListener("resize", scheduleReveal);
}

/* -------- Destacadas (Inicio) -------- */
function featuredCards(type, count) {
  return listings
    .filter((item) => item.type === type)
    .sort((a, b) => (b.badges && b.badges.length ? 1 : 0) - (a.badges && a.badges.length ? 1 : 0))
    .slice(0, count);
}

function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  const items = [...featuredCards("propiedad", 4), ...featuredCards("vehiculo", 2)];
  grid.innerHTML = items.map(cardHtml).join("");
  attachVideoPreviews(grid);
  revealInView(grid);
}

/* -------- Carrusel de propiedades destacadas (Inicio) -------- */
function showcaseCardHtml(listing) {
  const cover = coverImage(listing);
  return `
    <a href="p/${encodeURIComponent(listing.id)}/" class="showcase-card">
      <img src="${cover}" alt="${listing.title}" loading="lazy">
      <div class="showcase-card-overlay">
        <span class="showcase-card-price">${formatPrice(listing)}</span>
        <span class="showcase-card-title">${listing.title}</span>
        <span class="showcase-card-location">${listing.location}</span>
      </div>
    </a>
  `;
}

function initShowcase() {
  const track = document.getElementById("showcase-track");
  if (!track) return;

  const items = listings
    .filter((item) => item.type === "propiedad" && item.images && item.images.length)
    .sort((a, b) => (b.badges && b.badges.length ? 1 : 0) - (a.badges && a.badges.length ? 1 : 0))
    .slice(0, 10);
  if (!items.length) {
    track.closest(".showcase")?.remove();
    return;
  }
  track.innerHTML = items.map(showcaseCardHtml).join("");

  const scrollByCard = (dir) => {
    const card = track.querySelector(".showcase-card");
    const step = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  document.querySelectorAll(".showcase-arrow").forEach((btn) => {
    btn.addEventListener("click", () => scrollByCard(btn.dataset.dir === "prev" ? -1 : 1));
  });

  // Auto-avance suave, en pausa al pasar el mouse o tocar.
  let paused = false;
  track.addEventListener("mouseenter", () => (paused = true));
  track.addEventListener("mouseleave", () => (paused = false));
  track.addEventListener("touchstart", () => (paused = true), { passive: true });
  setInterval(() => {
    if (paused || document.hidden) return;
    if (document.querySelector('.view[data-view="inicio"]')?.classList.contains("is-active") === false) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    if (atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      scrollByCard(1);
    }
  }, 3500);
}

/* -------- Estadísticas (Nosotros) -------- */
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

/* -------- Catálogo (Propiedades / Vehículos) -------- */
function initCatalogView(section) {
  const type = section.dataset.type;
  const grid = section.querySelector(".js-catalog-grid");
  const countEl = section.querySelector(".js-catalog-count");
  const locationEl = section.querySelector(".js-filter-location");
  const minEl = section.querySelector(".js-filter-min");
  const maxEl = section.querySelector(".js-filter-max");
  const clearBtn = section.querySelector(".js-filter-clear");
  if (!grid) return;

  const items = listings.filter((item) => item.type === type);

  if (locationEl) {
    const locations = Array.from(new Set(items.map((i) => i.location))).sort((a, b) =>
      a.localeCompare(b, "es")
    );
    locationEl.innerHTML =
      '<option value="">Todas las ubicaciones</option>' +
      locations.map((loc) => `<option value="${loc}">${loc}</option>`).join("");
  }

  const render = () => {
    const location = locationEl ? locationEl.value : "";
    const priceMin = minEl && minEl.value !== "" ? Number(minEl.value) : null;
    const priceMax = maxEl && maxEl.value !== "" ? Number(maxEl.value) : null;

    const filtered = items.filter((item) => {
      if (location && item.location !== location) return false;
      if (priceMin !== null && item.price < priceMin) return false;
      if (priceMax !== null && item.price > priceMax) return false;
      return true;
    });

    const label = type === "propiedad" ? "propiedades" : "vehículos";
    grid.innerHTML = filtered.length
      ? filtered.map(cardHtml).join("")
      : `<p class="catalog-empty">No encontramos ${label} con esos filtros. Prueba ajustando la búsqueda.</p>`;
    if (countEl) countEl.textContent = `${filtered.length} ${label} disponibles`;
    attachVideoPreviews(grid);
    revealInView(grid);
  };

  if (locationEl) locationEl.addEventListener("change", render);
  if (minEl) minEl.addEventListener("input", render);
  if (maxEl) maxEl.addEventListener("input", render);
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (locationEl) locationEl.value = "";
      if (minEl) minEl.value = "";
      if (maxEl) maxEl.value = "";
      render();
    });
  }

  render();
}

function initCatalogs() {
  document.querySelectorAll(".catalog.view[data-type]").forEach(initCatalogView);
}

/* -------- Navegación entre vistas (pantallas) -------- */
const VIEW_TRANSITION_MS = 220;
const VIEW_KEYS = ["inicio", "propiedades", "vehiculos", "nosotros", "vender", "contacto"];

let currentViewKey = null;
let pendingViewTimeout = null;

function setActiveView(key, { animate = true } = {}) {
  const views = Array.from(document.querySelectorAll(".view[data-view]"));
  const next = views.find((v) => v.dataset.view === key);
  if (!next || currentViewKey === key) return false;

  const previous = views.find((v) => v.dataset.view === currentViewKey);
  currentViewKey = key;

  if (pendingViewTimeout) {
    clearTimeout(pendingViewTimeout);
    pendingViewTimeout = null;
  }

  function activate() {
    views.forEach((v) => v.classList.remove("is-active", "is-fading"));
    next.classList.add("is-active", "is-fading");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      revealInView(next);
      requestAnimationFrame(() => next.classList.remove("is-fading"));
    });
  }

  if (!animate || !previous) {
    activate();
    return true;
  }

  previous.classList.add("is-fading");
  pendingViewTimeout = setTimeout(() => {
    pendingViewTimeout = null;
    activate();
  }, VIEW_TRANSITION_MS);
  return true;
}

function setActiveNavLink(key) {
  document.querySelectorAll(".main-nav a[data-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === key);
  });
}

function viewTargetFromUrl(url) {
  const tipo = url.searchParams.get("tipo");
  if (tipo === "propiedad") return "propiedades";
  if (tipo === "vehiculo") return "vehiculos";
  const hashKey = url.hash ? url.hash.slice(1) : "";
  if (hashKey === "catalogo") return "propiedades"; // compat con enlaces viejos
  if (VIEW_KEYS.includes(hashKey)) return hashKey;
  return "inicio";
}

// El router se basa en el hash de la URL: cuando el hash cambia (por un
// clic en un enlace #vista o por los botones atrás/adelante), se cambia
// de pantalla. Así el cambio de URL ES lo que dispara el cambio de
// vista — no depende de interceptar el clic, que en algunos navegadores
// fallaba (la URL cambiaba pero la pantalla no se actualizaba).
function initViews() {
  const views = document.querySelectorAll(".view[data-view]");
  if (!views.length) return;
  document.body.classList.add("js-views");

  function routeFromLocation() {
    const view = viewTargetFromUrl(new URL(window.location.href));
    setActiveView(view);
    setActiveNavLink(view);
  }

  window.addEventListener("hashchange", routeFromLocation);

  // Respaldo: si un clic en un enlace interno no llega a cambiar el hash
  // (por ejemplo si el navegador no lo procesa), lo forzamos aquí.
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"], a[href*="index.html#"]');
    if (!link) return;
    const url = new URL(link.getAttribute("href"), window.location.href);
    // Solo intervenimos en enlaces internos de esta misma página.
    if (url.pathname !== window.location.pathname && !/(^|\/)index\.html$/.test(url.pathname)) return;
    e.preventDefault();
    const view = viewTargetFromUrl(url);
    const targetHash = view === "inicio" ? "#inicio" : `#${view}`;
    if (window.location.hash !== targetHash) {
      // Cambiar el hash dispara 'hashchange' → routeFromLocation.
      window.location.hash = targetHash;
    } else {
      routeFromLocation();
    }
  });

  const initial = viewTargetFromUrl(new URL(window.location.href));
  setActiveView(initial, { animate: false });
  setActiveNavLink(initial);
}

document.addEventListener("DOMContentLoaded", () => {
  initStatsCount();
  renderFeatured();
  initShowcase();
  initCatalogs();
  initViews();
  initReveals();
});
