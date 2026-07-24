/* ============================================
   PIMTEL — Funciones compartidas entre páginas
   ============================================ */

/* --------------------------------------------
   NÚMERO DE WHATSAPP DEL NEGOCIO
   Reemplazar por el número real de Pimtel con
   código de país y SIN signos "+" ni espacios.
   Ejemplo El Salvador: "50378001234"
   -------------------------------------------- */
const WHATSAPP_NUMBER = "50361968521";

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

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function isVideoFile(url) {
  return !!url && /\.(mp4|webm|mov)$/i.test(url);
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

  const sellBtn = document.getElementById("sell-whatsapp-btn");
  if (sellBtn) {
    sellBtn.href = buildWhatsAppLink(
      "Hola, tengo una propiedad/vehículo que me gustaría vender con Pimtel. Les comparto los detalles:"
    );
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initContactForm() {
  const referenciaField = document.getElementById("form-referencia");
  if (!referenciaField) return;

  const telefonoField = document.getElementById("form-telefono");
  if (telefonoField) {
    telefonoField.addEventListener("input", () => {
      telefonoField.value = telefonoField.value.replace(/[^0-9]/g, "");
    });
  }

  const datalist = document.getElementById("form-referencia-list");
  if (datalist && typeof listings !== "undefined") {
    datalist.innerHTML = listings
      .map((item) => `<option value="${item.title} (ref. ${item.id})"></option>`)
      .join("");
  }

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return;

  if (typeof listings !== "undefined") {
    const listing = listings.find((item) => item.id === ref);
    referenciaField.value = listing ? `${listing.title} (ref. ${listing.id})` : ref;
  } else {
    referenciaField.value = ref;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initWhatsAppFloat();
  initMobileNav();
  initContactSection();
  initContactForm();
});
