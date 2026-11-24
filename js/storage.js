function cargarPokemon() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(datos)) return [];
    const vistos = new Set();
    return datos.filter((p) => {
      const valido = p && Number.isInteger(p.id) && p.id >= 1 && p.id <= TOTAL
        && typeof p.name === 'string' && Array.isArray(p.types) && !vistos.has(p.id);
      if (valido) vistos.add(p.id);
      return valido;
    });
  } catch (e) {
    return [];
  }
}

let capturados = cargarPokemon();

function estaCapturado(id) {
  return capturados.some((p) => p.id === id);
}

function guardarPokemon(pokemon) {
  if (estaCapturado(pokemon.id)) return 'repetido';
  const nueva = [...capturados, pokemon];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva));
  } catch (e) {
    return 'error';
  }
  capturados = nueva;
  return 'ok';
}
