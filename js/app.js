let vistaActual = 'pokedex';
let sheetModo = null;
let pendiente = null;
let idConsulta = null;
let consultaActual = 0;
let toastTimer;

const $ = (id) => document.getElementById(id);
const fmtId = (id) => '#' + String(id).padStart(3, '0');
const capitalizar = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const formatearTexto = (t) => capitalizar(String(t).replace(/-/g, ' '));
const formatearNombre = (n) => NOMBRES_ESPECIALES[n] || formatearTexto(n);
const imagenDe = (p) => p.image || SPRITE_URL + p.id + '.png';

/* Pokédex */

function crearPills(types) {
  return types.map((t) =>
    `<span class="rounded-md px-2 py-0.5 text-[9px] font-semibold text-neutral-900 ring-1 ring-white/70" style="background:${COLOR_TIPO[t] || '#ddd'}">${formatearTexto(t)}</span>`
  ).join('');
}

function crearTarjeta(id, p) {
  const fondo = p ? 'from-[#b9ecbd] to-[#3fc35c]' : 'from-[#ececec] to-[#a8a8a8]';
  const tipos = p
    ? crearPills(p.types)
    : '<span class="rounded-md bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-neutral-500">???</span>';
  const card = document.createElement('button');
  card.className = 'relative flex h-44 flex-col overflow-hidden rounded-xl bg-white text-left shadow active:scale-[0.98]';
  if (p) card.dataset.abrir = id;
  else card.setAttribute('aria-label', fmtId(id) + ' Pokémon no descubierto');
  card.innerHTML = `
    <span class="absolute right-2 top-1.5 text-[9px] text-neutral-500">${fmtId(id)}</span>
    <div class="flex flex-1 items-center justify-center px-2 pt-4">
      <img src="${p ? imagenDe(p) : SPRITE_URL + id + '.png'}" alt="" loading="lazy" class="h-20 w-20 object-contain ${p ? '' : 'brightness-0'}">
    </div>
    <div class="flex flex-col items-center gap-1 bg-gradient-to-b ${fondo} px-2 pb-2.5 pt-2">
      <span class="text-xs font-semibold text-white">${p ? formatearNombre(p.name) : '???'}</span>
      <div class="flex gap-1">${tipos}</div>
    </div>`;
  return card;
}

function renderizarPokedex() {
  const grid = $('pokedex-contenido');
  grid.innerHTML = '';
  for (let id = 1; id <= TOTAL; id++) {
    grid.appendChild(crearTarjeta(id, capturados.find((p) => p.id === id)));
  }
  $('pokedex-vacio').classList.toggle('hidden', capturados.length > 0);
  $('pokedex-vacio').classList.toggle('flex', capturados.length === 0);
}

function actualizarProgreso() {
  const n = capturados.length;
  const pct = (n / TOTAL) * 100;
  const ancho = n === 0 ? 0 : Math.max(pct, 2);

  $('hdr-count').textContent = `${n}/${TOTAL}`;
  $('hdr-bar').style.width = ancho + '%';
  $('prog-pct').textContent = pct.toFixed(1) + '%';
  $('prog-count').textContent = `${n}/${TOTAL} pokemon`;
  $('prog-bar').style.width = ancho + '%';
  $('prog-cap').textContent = n;
  $('prog-falta').textContent = TOTAL - n;
  $('ring').style.strokeDashoffset = 326.7 * (1 - pct / 100);

  const ultimo = [...capturados].sort((a, b) => String(a.capturedAt).localeCompare(String(b.capturedAt))).pop();
  $('prog-ultimo-card').classList.toggle('hidden', !ultimo);
  $('prog-ultimo-card').classList.toggle('flex', !!ultimo);
  if (ultimo) {
    $('prog-ultimo').textContent = `${fmtId(ultimo.id)} ${formatearNombre(ultimo.name)}`;
    $('prog-ultimo-img').src = imagenDe(ultimo);
  }
}

/* Bottom Sheet */

function infoPokemonHTML(p) {
  const stats = Object.entries(p.stats || {}).map(([k, v]) => `
    <div class="flex items-center gap-2 text-[10px]">
      <span class="w-12 text-left text-neutral-600">${k}</span>
      <span class="w-6 text-right font-semibold text-neutral-800">${v}</span>
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-300"><div class="h-full rounded-full bg-dex" style="width:${Math.min(v / 150 * 100, 100)}%"></div></div>
    </div>`).join('');
  const habilidades = (p.abilities || []).map(formatearTexto).join(', ') || '-';

  return `
    <p class="text-[11px] text-neutral-700">${fmtId(p.id)}</p>
    <h2 class="text-xl font-extrabold text-neutral-900">${formatearNombre(p.name)}</h2>
    <img src="${imagenDe(p)}" alt="${formatearNombre(p.name)}" class="mx-auto my-2 h-40 w-40 object-contain">
    <div class="grid gap-3" style="grid-template-columns:repeat(${p.types.length},minmax(0,1fr))">${p.types.map((t) =>
      `<span class="rounded-md py-1 text-xs font-semibold text-neutral-900" style="background:${COLOR_TIPO[t] || '#ddd'}">${formatearTexto(t)}</span>`).join('')}</div>
    <div class="mt-5 grid grid-cols-2 gap-3 text-left">
      <div><p class="text-xs font-extrabold text-neutral-900">Height</p><p class="text-[11px] text-neutral-600">${p.height != null ? p.height + ' m' : '-'}</p></div>
      <div><p class="text-xs font-extrabold text-neutral-900">Weight</p><p class="text-[11px] text-neutral-600">${p.weight != null ? p.weight + ' kg' : '-'}</p></div>
    </div>
    <div class="mt-4 text-left">
      <p class="text-xs font-extrabold text-neutral-900">Abilities</p>
      <p class="text-[11px] text-neutral-600">${habilidades}</p>
    </div>
    ${stats ? `<div class="mt-4 space-y-1.5 text-left"><p class="text-xs font-extrabold text-neutral-900">Stats</p>${stats}</div>` : ''}`;
}

function mostrarSheet(html, modo) {
  sheetModo = modo;
  $('sheet-body').innerHTML = html;
  $('sheet').scrollTop = 0;
  $('sheet').classList.remove('translate-y-full', 'pointer-events-none');
  $('sheet-overlay').classList.remove('opacity-0', 'pointer-events-none');
}

function cerrarSheet() {
  const modo = sheetModo;
  sheetModo = null;
  pendiente = null;
  consultaActual++;
  $('sheet').classList.add('translate-y-full', 'pointer-events-none');
  $('sheet-overlay').classList.add('opacity-0', 'pointer-events-none');
  if (modo && modo !== 'detalle' && vistaActual === 'scanner') reanudarScanner();
}

function abrirDetalle(id) {
  const p = capturados.find((x) => x.id === id);
  if (p) mostrarSheet(infoPokemonHTML(p), 'detalle');
}

function mostrarSheetCargando() {
  mostrarSheet(`
    <div class="flex flex-col items-center py-10">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-dex"></div>
      <p class="mt-4 text-xs font-semibold text-neutral-700">Consultando Pokédex...</p>
    </div>`, 'cargando');
}

function mostrarSheetError() {
  mostrarSheet(`
    <div class="flex flex-col items-center py-6">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white text-dex">
        <svg class="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/></svg>
      </div>
      <h2 class="mt-3 text-base font-extrabold text-neutral-900">Algo salió mal</h2>
      <p class="mt-1 text-xs text-neutral-600">${MENSAJES.conexion}</p>
      <div class="mt-5 grid w-full grid-cols-2 gap-3">
        <button data-accion="cancelar" class="rounded-full bg-neutral-300 py-3 text-xs font-semibold text-neutral-800 active:scale-95">Cancelar</button>
        <button data-accion="reintentar" class="rounded-full bg-dex py-3 text-xs font-semibold text-white active:scale-95">Reintentar</button>
      </div>
    </div>`, 'error');
}

function mostrarSheetPreview(p) {
  pendiente = p;
  mostrarSheet(`
    <p class="mb-1 text-[10px] font-semibold text-dex">¡Pokémon encontrado!</p>
    ${infoPokemonHTML(p)}
    <div class="mt-6 grid grid-cols-2 gap-3">
      <button data-accion="cancelar" class="rounded-full bg-neutral-300 py-3 text-xs font-semibold text-neutral-800 active:scale-95">Cancelar</button>
      <button data-accion="capturar" class="rounded-full bg-dex py-3 text-xs font-semibold text-white active:scale-95">Capturar</button>
    </div>`, 'preview');
}

/* Toast */

function mostrarToast(texto, tipo = 'ok') {
  const colores = { ok: 'bg-green-400', warn: 'bg-amber-400', error: 'bg-red-500' };
  $('toast-text').textContent = texto;
  $('toast-dot').className = `h-2.5 w-2.5 shrink-0 rounded-full ${colores[tipo]}`;
  $('toast').classList.remove('opacity-0', 'translate-y-2');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.add('opacity-0', 'translate-y-2'), 2800);
}

/* Captura */

function esperarYReanudar() {
  setTimeout(reanudarScanner, 2200);
}

async function consultarYMostrar(id) {
  idConsulta = id;
  const turno = ++consultaActual;
  mostrarSheetCargando();
  try {
    const pokemon = await buscarPokemon(id);
    if (turno !== consultaActual) return;
    mostrarSheetPreview(pokemon);
  } catch (e) {
    if (turno !== consultaActual) return;
    mostrarSheetError();
    mostrarToast(MENSAJES.conexion, 'error');
  }
}

async function procesarQR(texto) {
  const id = validarQR(texto);
  if (id === null) {
    mostrarToast(MENSAJES.invalido, 'error');
    return esperarYReanudar();
  }
  if (estaCapturado(id)) {
    mostrarToast(MENSAJES.repetido, 'warn');
    return esperarYReanudar();
  }
  await consultarYMostrar(id);
}

function confirmarCaptura() {
  const pokemon = pendiente;
  if (!pokemon) return;

  const resultado = guardarPokemon({ ...pokemon, capturedAt: new Date().toISOString() });
  sheetModo = null;
  cerrarSheet();

  if (resultado === 'repetido') {
    mostrarToast(MENSAJES.repetido, 'warn');
    return reanudarScanner();
  }
  if (resultado === 'error') {
    mostrarToast(MENSAJES.guardado, 'error');
    return reanudarScanner();
  }

  renderizarPokedex();
  actualizarProgreso();
  mostrarVista('pokedex');
  const emoji = EMOJI_TIPO[pokemon.types[0]] || '✨';
  mostrarToast(`¡${formatearNombre(pokemon.name)} fue agregado a tu Pokédex! ${emoji}`);
}

/* Navegación */

function mostrarVista(vista) {
  vistaActual = vista;
  cerrarSheet();
  document.querySelectorAll('[data-view]').forEach((s) => s.classList.toggle('hidden', s.dataset.view !== vista));
  document.querySelectorAll('[data-nav]').forEach((b) => {
    b.classList.toggle('bg-black/30', b.dataset.nav === (vista === 'scanner' ? 'pokedex' : vista));
  });
  $('fab').classList.toggle('hidden', vista === 'scanner');
  $('header').classList.toggle('pb-10', vista === 'scanner');
  $('header').classList.toggle('pb-3', vista !== 'scanner');
  $('header-progress').classList.toggle('hidden', vista === 'scanner');
  document.querySelector('main').scrollTop = 0;

  if (vista === 'scanner') iniciarScanner();
  else detenerScanner();
}

function iniciarEventos() {
  document.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => mostrarVista(b.dataset.nav)));
  $('fab').addEventListener('click', () => mostrarVista('scanner'));

  document.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('[data-abrir]');
    if (tarjeta) return abrirDetalle(Number(tarjeta.dataset.abrir));

    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const acciones = {
      capturar: confirmarCaptura,
      cancelar: cerrarSheet,
      reintentar: () => consultarYMostrar(idConsulta),
      'reintentar-camara': iniciarScanner,
    };
    if (acciones[boton.dataset.accion]) acciones[boton.dataset.accion]();
  });

  $('sheet-overlay').addEventListener('click', cerrarSheet);
  $('sheet-handle').addEventListener('click', cerrarSheet);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && cerrarSheet());

  $('btn-imagen').addEventListener('click', () => $('qr-file').click());
  $('qr-file').addEventListener('change', (e) => {
    escanearImagen(e.target.files[0]);
    e.target.value = '';
  });
}

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

renderizarPokedex();
actualizarProgreso();
iniciarEventos();
mostrarVista('pokedex');
registrarServiceWorker();
