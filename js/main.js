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
        <div class="card-media">
          <img src="${cover}" alt="${listing.title}" loading="lazy">
          ${listing.badge ? `<span class="card-badge">${listing.badge}</span>` : ""}
          <span class="card-type">${listing.type === "propiedad" ? "Propiedad" : "Vehículo"}</span>
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
