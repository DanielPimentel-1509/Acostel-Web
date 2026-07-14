/* ============================================
   ACOSTEL — Datos del catálogo
   ------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para
   agregar, editar o quitar propiedades y vehículos.

   Cada ficha es un bloque { ... } dentro del arreglo
   `listings`. Copia un bloque existente, pégalo,
   cambia el "id" (debe ser único) y actualiza los
   demás datos.

   type: "propiedad" o "vehiculo"
   images: lista de rutas a fotos. Mientras no haya
   fotos reales, se usan las imágenes de marcador
   images/site/placeholder-propiedad.svg o
   images/site/placeholder-vehiculo.svg

   video (opcional): agrega esta línea a cualquier ficha
   para mostrar un video. Al pasar el mouse sobre la
   tarjeta (o mantener presionado en el celular) se
   reproduce una vista previa; en la ficha aparece un
   reproductor completo. Acepta dos formas:
     video: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
     video: "images/listings/veh-001.mp4"
   Para videos largos (recorridos completos) se recomienda
   subirlos a YouTube como "no listado" y pegar el link acá,
   en vez de subir el archivo de video directo al repositorio.
   ============================================ */

const listings = [
  // ---------------- PROPIEDADES (EJEMPLO) ----------------
  {
    id: "prop-001",
    type: "propiedad",
    title: "Casa moderna en Santa Elena",
    price: 185000,
    location: "Antiguo Cuscatlán, La Libertad",
    badge: "Destacada",
    operacion: "Venta",
    summary: "Residencia de una planta con acabados de lujo en zona residencial vigilada.",
    description:
      "Amplia residencia de una sola planta ubicada en exclusiva colonia residencial de Santa Elena. Cuenta con acabados de alta calidad, iluminación natural en todas las habitaciones y áreas sociales integradas con el jardín. A pocos minutos de centros comerciales, colegios y vías principales.",
    specs: {
      habitaciones: 3,
      banos: 2.5,
      areaConstruccion: "220 m²",
      areaTerreno: "350 m²",
      parqueos: 2,
    },
    features: [
      "Cocina con isla",
      "Jardín privado",
      "Zona residencial vigilada",
      "Cuarto de servicio",
      "Aire acondicionado en habitaciones",
      "Portón eléctrico",
    ],
    images: [
      "images/site/placeholder-propiedad.svg",
      "images/site/placeholder-propiedad.svg",
      "images/site/placeholder-propiedad.svg",
    ],
  },
  {
    id: "prop-002",
    type: "propiedad",
    title: "Apartamento con vista en Torre Futura",
    price: 145000,
    location: "San Salvador",
    operacion: "Venta",
    summary: "Apartamento de dos niveles con vista panorámica a la ciudad.",
    description:
      "Elegante apartamento ubicado en una de las torres más reconocidas de San Salvador. Distribución funcional en dos niveles, ventanales de piso a techo y acceso a amenidades como piscina, gimnasio y seguridad 24/7.",
    specs: {
      habitaciones: 2,
      banos: 2,
      areaConstruccion: "140 m²",
      areaTerreno: "—",
      parqueos: 2,
    },
    features: [
      "Vista panorámica",
      "Piscina y gimnasio",
      "Seguridad 24/7",
      "Balcón privado",
      "Elevador",
    ],
    images: [
      "images/site/placeholder-propiedad.svg",
      "images/site/placeholder-propiedad.svg",
    ],
  },
  {
    id: "prop-003",
    type: "propiedad",
    title: "Casa campestre en Santa Tecla",
    price: 950,
    location: "Santa Tecla, La Libertad",
    operacion: "Renta",
    summary: "Casa de dos plantas rodeada de naturaleza, ideal para familias.",
    description:
      "Casa de dos plantas en zona alta de Santa Tecla, con clima fresco y vistas a las montañas. Amplio jardín, terraza techada y espacio para huerto familiar. Disponible para renta a largo plazo.",
    specs: {
      habitaciones: 4,
      banos: 3,
      areaConstruccion: "260 m²",
      areaTerreno: "500 m²",
      parqueos: 3,
    },
    features: [
      "Terraza techada",
      "Amplio jardín",
      "Clima fresco",
      "Chimenea",
      "Bodega",
    ],
    images: [
      "images/site/placeholder-propiedad.svg",
      "images/site/placeholder-propiedad.svg",
    ],
  },
  {
    id: "prop-004",
    type: "propiedad",
    title: "Terreno comercial sobre carretera",
    price: 220000,
    location: "Santa Ana",
    operacion: "Venta",
    summary: "Terreno plano con excelente visibilidad sobre carretera principal.",
    description:
      "Terreno plano de 1,200 m² sobre carretera de alto tráfico, ideal para desarrollo comercial. Cuenta con todos los servicios básicos disponibles y fácil acceso.",
    specs: {
      habitaciones: "—",
      banos: "—",
      areaConstruccion: "—",
      areaTerreno: "1,200 m²",
      parqueos: "—",
    },
    features: [
      "Uso de suelo comercial",
      "Servicios disponibles",
      "Alta visibilidad",
      "Fácil acceso",
    ],
    images: [
      "images/site/placeholder-propiedad.svg",
    ],
  },

  // ---------------- VEHÍCULOS (EJEMPLO) ----------------
  {
    id: "veh-001",
    type: "vehiculo",
    title: "Toyota Hilux 4x4 2022",
    price: 28500,
    location: "San Salvador",
    badge: "Destacado",
    operacion: "Venta",
    summary: "Pick-up doble cabina 4x4, full extras, único dueño.",
    description:
      "Toyota Hilux 2022 en excelente estado, único dueño, todos los mantenimientos al día. Motor diésel 2.4L, tracción 4x4, cámara de reversa y full extras. Ideal para trabajo y familia.",
    specs: {
      anio: 2022,
      kilometraje: "32,000 km",
      transmision: "Automática",
      combustible: "Diésel",
      motor: "2.4L",
    },
    features: [
      "Tracción 4x4",
      "Cámara de reversa",
      "Aire acondicionado",
      "Bluetooth",
      "Único dueño",
    ],
    images: [
      "images/site/placeholder-vehiculo.svg",
      "images/site/placeholder-vehiculo.svg",
    ],
  },
  {
    id: "veh-002",
    type: "vehiculo",
    title: "Honda CR-V EX 2021",
    price: 24900,
    location: "Santa Ana",
    operacion: "Venta",
    summary: "SUV familiar automática, full extras, mantenimientos de agencia.",
    description:
      "Honda CR-V 2021 en perfecto estado, mantenimientos realizados en agencia autorizada. Espaciosa, cómoda y económica, ideal para uso familiar.",
    specs: {
      anio: 2021,
      kilometraje: "41,500 km",
      transmision: "Automática",
      combustible: "Gasolina",
      motor: "1.5L Turbo",
    },
    features: [
      "Techo panorámico",
      "Cámara de reversa",
      "Sensores de parqueo",
      "Asientos de cuero",
    ],
    images: [
      "images/site/placeholder-vehiculo.svg",
    ],
  },
  {
    id: "veh-003",
    type: "vehiculo",
    title: "Mazda 3 Sedán 2020",
    price: 15800,
    location: "San Miguel",
    operacion: "Venta",
    summary: "Sedán económico y elegante, ideal para ciudad.",
    description:
      "Mazda 3 2020 con bajo kilometraje, motor eficiente y diseño elegante. Perfecto para uso diario en ciudad, con excelente rendimiento de combustible.",
    specs: {
      anio: 2020,
      kilometraje: "28,900 km",
      transmision: "Automática",
      combustible: "Gasolina",
      motor: "2.0L",
    },
    features: [
      "Pantalla táctil",
      "Cámara de reversa",
      "Control crucero",
      "Llantas de aleación",
    ],
    images: [
      "images/site/placeholder-vehiculo.svg",
    ],
  },
  {
    id: "veh-004",
    type: "vehiculo",
    title: "Ford Ranger XLT 2019",
    price: 19500,
    location: "La Libertad",
    operacion: "Venta",
    summary: "Pick-up doble cabina, motor diésel, ideal para trabajo.",
    description:
      "Ford Ranger 2019 doble cabina, motor diésel resistente y espacioso platón. Vehículo robusto, mantenido al día, ideal para trabajo y carretera.",
    specs: {
      anio: 2019,
      kilometraje: "55,200 km",
      transmision: "Manual",
      combustible: "Diésel",
      motor: "2.2L",
    },
    features: [
      "Doble cabina",
      "Aire acondicionado",
      "Radio Bluetooth",
      "Barras de platón",
    ],
    images: [
      "images/site/placeholder-vehiculo.svg",
    ],
  },
];
