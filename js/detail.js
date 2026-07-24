/* ============================================
   PIMTEL — Lógica de la página de ficha (detalle)
   ============================================ */

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
