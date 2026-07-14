# Sitio web de Acostel

Guía en español para entender, editar y publicar este sitio, pensada para
alguien sin experiencia en programación.

## ¿Qué es esto?

Un sitio web de **páginas simples** (sin instalación de programas raros):
HTML, CSS y JavaScript "puro". No necesita procesos de compilación (`build`)
ni servidores complicados. Se puede abrir directamente en un navegador o
publicar en cualquier servicio de hosting gratuito.

## Estructura de archivos

```
Acostel-Web/
├── index.html          → Página de inicio
├── ficha.html           → Plantilla de ficha individual (propiedad o vehículo)
├── css/
│   └── styles.css       → Todos los estilos (colores, tipografía, diseño)
├── js/
│   ├── data.js           ⭐ AQUÍ SE EDITA EL CATÁLOGO (propiedades y vehículos)
│   ├── common.js         → Número de WhatsApp y funciones compartidas
│   ├── main.js           → Lógica de la página de inicio (pestañas y tarjetas)
│   └── detail.js         → Lógica de la ficha individual
├── images/
│   ├── site/             → Imágenes del sitio (logo, fondos, marcadores)
│   └── listings/          → Aquí van las fotos reales de propiedades/vehículos
└── README.md            → Este archivo
```

## 1. Cómo agregar o editar una propiedad/vehículo

Todo el catálogo vive en **`js/data.js`**. Es una lista de bloques como este:

```js
{
  id: "prop-001",              // identificador único, no lo repitas en otra ficha
  type: "propiedad",           // "propiedad" o "vehiculo"
  title: "Casa moderna en Santa Elena",
  price: 185000,                // solo el número, sin comas ni signo $
  location: "Antiguo Cuscatlán, La Libertad",
  badge: "Destacada",           // opcional, puedes borrar esta línea
  operacion: "Venta",           // "Venta" o "Renta"
  summary: "Texto corto...",
  description: "Texto largo que aparece en la ficha...",
  specs: {
    habitaciones: 3,
    banos: 2.5,
    areaConstruccion: "220 m²",
    areaTerreno: "350 m²",
    parqueos: 2,
  },
  features: ["Cocina con isla", "Jardín privado", "..."],
  images: ["images/listings/prop-001-1.jpg", "images/listings/prop-001-2.jpg"],
},
```

Para vehículos, el bloque `specs` usa otros campos: `anio`, `kilometraje`,
`transmision`, `combustible`, `motor` (revisa los ejemplos ya incluidos en
el archivo).

**Para agregar una ficha nueva:** copia un bloque completo (desde `{` hasta
`},`), pégalo dentro de la lista, y cambia los datos. Como no sabes
programar, lo más fácil es que me pases la información (fotos, precio,
descripción, características) y yo actualizo el archivo por ti.

**Para quitar una ficha:** se borra el bloque completo.

Todas las fichas de ejemplo que ves ahora mismo (4 propiedades y 4
vehículos) son **contenido de muestra** para que veas cómo luce el sitio.
Cuando me compartas tus propiedades/vehículos reales, reemplazamos esos
bloques.

## 2. Fotos

Ahora mismo todas las fichas usan una imagen de "marcador" (un dibujo con
el texto "Foto próximamente"). Cuando tengas fotos reales:

1. Envíamelas (o dime dónde están) y las agrego a `images/listings/`.
2. Actualizo la lista `images: [...]` de cada ficha en `data.js` para que
   apunten a esas fotos.

La primera imagen de la lista es la que aparece en la tarjeta del catálogo;
todas las imágenes aparecen como galería en la ficha individual.

## 2.1 Videos

Cada ficha puede tener un video (opcional). Al pasar el mouse sobre la
tarjeta en el catálogo (o mantener presionado en el celular) se reproduce
una vista previa automática, silenciosa y en bucle — como en YouTube o
Instagram. En la ficha individual aparece un reproductor completo.

Para agregarlo, solo agrega una línea `video:` al bloque de la ficha en
`data.js`, de dos formas posibles:

- **Un link de YouTube** (recomendado para recorridos completos):
  `video: "https://www.youtube.com/watch?v=XXXXXXXXXXX"`
  Sube el video a YouTube como **"No listado"** (así no aparece en
  búsquedas, pero el link funciona) y pega esa dirección aquí.
- **Un archivo de video subido directo al repositorio** (mejor para clips
  cortos, de pocos segundos): `video: "images/listings/veh-001.mp4"`
  Evita subir videos largos así — hacen el sitio lento y GitHub limita el
  tamaño de archivos.

## 3. Número de WhatsApp

Está definido en **`js/common.js`**, en esta línea:

```js
const WHATSAPP_NUMBER = "50300000000"; // TODO: reemplazar por el número real
```

Debe llevar el código de país sin el signo `+` ni espacios (ejemplo real de
El Salvador: `50378001234`). **Pásame tu número de WhatsApp de negocio y lo
actualizo.** Este número es el que se usa en:
- El botón flotante de WhatsApp (esquina inferior derecha, en todo el sitio).
- El botón "Contáctanos" del encabezado.
- El botón "Consultar por WhatsApp" de cada ficha (el mensaje ya incluye
  automáticamente el nombre de la propiedad/vehículo).

## 4. Logo

Por ahora el logo es texto estilizado ("ACOSTEL"). Si tienes un logo ya
diseñado (PNG, SVG o JPG), lo agrego en el encabezado y pie de página en
lugar del texto.

## 5. Colores y tipografía (ya aplicados)

| Uso | Color |
|---|---|
| Azul principal | `#0F3D5E` |
| Dorado (acento) | `#C9A85D` |
| Negro | `#000000` |
| Blanco | `#FFFFFF` |
| Gris oscuro (texto) | `#2F2F2F` |
| Gris claro (fondos) | `#F5F5F5` |

Tipografía: **Cormorant Garamond** para títulos, **Inter** para el resto
del texto (cargadas desde Google Fonts).

## 6. Cómo ver el sitio en tu computadora (sin publicar nada)

No necesitas instalar nada: solo haz doble clic en el archivo `index.html`
y se abrirá en tu navegador. Podrás navegar por todo el sitio, cambiar
pestañas y abrir fichas, tal como lo verían tus clientes.

## 7. Cómo publicar el sitio en internet

Esto es un paso que debes hacer tú (o pedirme que te guíe en video/paso a
paso), porque implica crear una cuenta en un servicio externo. La opción
más simple para alguien sin experiencia técnica es **Netlify**:

1. Entra a [netlify.com](https://www.netlify.com) y crea una cuenta gratis.
2. En el panel, busca la opción de "arrastrar y soltar" una carpeta
   (*"Deploy manually" / "Drag and drop"*).
3. Arrastra la carpeta completa de este proyecto.
4. Netlify te da un enlace gratuito (ej. `acostel.netlify.app`) en segundos.
5. Si ya tienes un dominio propio (ej. `acostel.com`), Netlify te permite
   conectarlo desde la sección "Domain settings".

Cuando quieras dar este paso, avísame y te acompaño con instrucciones
exactas según lo que vayas viendo en pantalla.

## Próximos pasos pendientes de tu parte

- [ ] Número de WhatsApp real del negocio.
- [ ] Logo (si ya tienes uno diseñado).
- [ ] Fotos y datos reales de propiedades y vehículos (pueden ser pocos
      para empezar, se pueden ir agregando).
- [ ] Textos de "Nosotros" si quieres algo distinto al texto genérico
      actual.
- [ ] Decidir si quieres publicar el sitio ahora (te guío) o seguir
      revisando cambios primero.
