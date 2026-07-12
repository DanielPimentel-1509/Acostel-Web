/* ============================================
   ACOSTEL — Funciones compartidas entre páginas
   ============================================ */

/* --------------------------------------------
   NÚMERO DE WHATSAPP DEL NEGOCIO
   Reemplazar por el número real de Acostel con
   código de país y SIN signos "+" ni espacios.
   Ejemplo El Salvador: "50378001234"
   -------------------------------------------- */
const WHATSAPP_NUMBER = "50300000000"; // TODO: reemplazar por el número real

function buildWhatsAppLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
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

function initWhatsAppFloat() {
  const float = document.getElementById("whatsapp-float");
  if (!float) return;
  float.href = buildWhatsAppLink(
    "Hola, vi su sitio web y me gustaría más información sobre sus propiedades y vehículos."
  );
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

function initContactSection() {
  const whatsappMessage = "Hola, me gustaría más información sobre sus propiedades y vehículos.";
  const contactBtn = document.getElementById("contact-whatsapp-btn");
  if (contactBtn) contactBtn.href = buildWhatsAppLink(whatsappMessage);

  const footerLink = document.getElementById("footer-whatsapp-link");
  if (footerLink) footerLink.href = buildWhatsAppLink(whatsappMessage);

  const phoneLink = document.getElementById("contact-phone-link");
  if (phoneLink) phoneLink.href = buildWhatsAppLink(whatsappMessage);

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  initWhatsAppFloat();
  initMobileNav();
  initContactSection();
});
