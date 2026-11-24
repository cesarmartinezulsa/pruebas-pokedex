# Pokédex PWA

Pokédex de la primera generación (#001 Bulbasaur a #151 Mew). Los Pokémon no están disponibles desde el inicio: para capturarlos hay que escanear su código QR. La colección se guarda en el dispositivo con `localStorage`; no hay backend, base de datos ni inicio de sesión.

## Autores

- Caleb Aguilar León
- César Martínez Ruiz

## Cómo ejecutar

La cámara y el Service Worker solo funcionan en **HTTPS** o en **localhost**, así que no basta con abrir `index.html` con doble clic.

**Con un servidor local** (desde la carpeta del proyecto):

```bash
npx serve .
# o
python3 -m http.server 8000
```

Después abre `http://localhost:3000` (o `http://localhost:8000`) en el navegador.

**Con GitHub Pages:** en el repositorio ve a *Settings → Pages*, elige la rama `main` y la carpeta `/ (root)`. GitHub entrega la página por HTTPS y ahí ya funciona la cámara y la instalación de la PWA desde el celular.

Se necesita internet para consultar la PokéAPI y para ver por primera vez las imágenes de los Pokémon.

## Librería utilizada para QR

[html5-qrcode](https://github.com/mebjas/html5-qrcode) (v2.3.8). El archivo está en `js/vendor/` para que también funcione sin conexión.

## Cómo instalar la PWA

- **Android (Chrome):** menú ⋮ → *Instalar aplicación* (o *Agregar a la pantalla principal*).
- **iPhone (Safari):** botón de compartir → *Agregar a pantalla de inicio*.
- **Computadora (Chrome o Edge):** ícono de instalar en la barra de direcciones.

Una vez instalada se abre como aplicación independiente y la interfaz principal carga sin conexión; los Pokémon capturados se siguen mostrando. Para capturar uno nuevo sí se necesita internet.

## Códigos QR de prueba

En la carpeta `qr/` están los códigos de los 151 Pokémon (`pokemon:1` a `pokemon:151`). Abre `qr/index.html` para verlos en pantalla o imprimirlos. Los de prueba que pide el proyecto (1, 4, 7, 25, 39, 52, 94, 133, 150 y 151) aparecen primero.

## Estructura

```
pokedex/
├── index.html
├── manifest.json
├── service-worker.js
├── css/styles.css        CSS de Tailwind ya compilado
├── src/input.css         entrada de Tailwind
├── tailwind.config.js
├── js/
│   ├── datos.js          constantes, colores y mensajes
│   ├── storage.js        lectura y escritura en localStorage
│   ├── api.js            consulta a la PokéAPI
│   ├── scanner.js        cámara y validación del QR
│   ├── app.js            interfaz y flujo de captura
│   └── vendor/html5-qrcode.min.js
├── icons/                íconos de la PWA
├── assets/fonts/         fuente Inter
└── qr/                   códigos QR de los 151 Pokémon
```

## Modificar los estilos

Los estilos usan Tailwind CSS. Si cambias clases en `index.html` o en `js/`, vuelve a compilar el CSS:

```bash
npm install
npm run build:css
```

Si cambias archivos que se guardan en caché, sube también el número de versión de `CACHE` en `service-worker.js` para que los usuarios reciban la actualización.
