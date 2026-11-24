let lector = null;
let iniciando = false;
let procesando = false;

const SCANNING = 2;
const PAUSED = 3;

function validarQR(texto) {
  const coincide = /^pokemon:(\d+)$/.exec(String(texto).trim());
  if (!coincide) return null;
  const id = Number(coincide[1]);
  return id >= 1 && id <= TOTAL ? id : null;
}

function obtenerLector() {
  if (!lector) {
    lector = new Html5Qrcode('qr-reader', {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
  }
  return lector;
}

function mostrarMensajeScanner(texto) {
  $('scanner-msg-text').textContent = texto;
  $('scanner-msg').classList.remove('hidden');
}

function ocultarMensajeScanner() {
  $('scanner-msg').classList.add('hidden');
}

function mensajeErrorCamara(err) {
  const detalle = String(err && err.name ? err.name + ' ' + err.message : err);
  if (!window.isSecureContext) return 'La cámara solo funciona desde HTTPS o localhost.';
  if (/NotAllowed|Permission/i.test(detalle)) return 'Permiso de cámara rechazado. Actívalo en el navegador para poder escanear.';
  if (/NotFound|Requested device/i.test(detalle)) return 'No se encontró ninguna cámara en este dispositivo.';
  return 'No fue posible iniciar la cámara.';
}

async function iniciarScanner() {
  if (iniciando) return;
  ocultarMensajeScanner();
  procesando = false;

  if (typeof Html5Qrcode === 'undefined') {
    mostrarMensajeScanner('No se pudo cargar el lector de QR.');
    return;
  }

  const lector = obtenerLector();
  const estado = lector.getState();
  if (estado === SCANNING || estado === PAUSED) return;

  iniciando = true;
  try {
    await lector.start({ facingMode: 'environment' }, { fps: 10, aspectRatio: 1 }, alLeerQR, () => {});
    if (vistaActual !== 'scanner') await detenerScanner();
  } catch (err) {
    mostrarMensajeScanner(mensajeErrorCamara(err));
  } finally {
    iniciando = false;
  }
}

async function detenerScanner() {
  if (!lector) return;
  const estado = lector.getState();
  if (estado === SCANNING || estado === PAUSED) {
    try { await lector.stop(); } catch (e) { /* ya estaba detenido */ }
  }
  try { lector.clear(); } catch (e) { /* sin elementos que limpiar */ }
}

function alLeerQR(texto) {
  if (procesando) return;
  procesando = true;
  try { lector.pause(true); } catch (e) { /* sin cámara activa */ }
  procesarQR(texto);
}

function reanudarScanner() {
  procesando = false;
  if (lector && lector.getState() === PAUSED) {
    try { lector.resume(); } catch (e) { /* se reinicia al volver a abrir */ }
  } else if (vistaActual === 'scanner') {
    iniciarScanner();
  }
}

async function escanearImagen(archivo) {
  if (!archivo || procesando || typeof Html5Qrcode === 'undefined') return;
  procesando = true;
  await detenerScanner();
  try {
    const texto = await obtenerLector().scanFile(archivo, false);
    procesarQR(texto);
  } catch (e) {
    mostrarToast(MENSAJES.ilegible, 'error');
    reanudarScanner();
  }
}
