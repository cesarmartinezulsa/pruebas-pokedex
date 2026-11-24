async function buscarPokemon(id) {
  if (!navigator.onLine) throw new Error('sin conexión');

  const control = new AbortController();
  const limite = setTimeout(() => control.abort(), 10000);
  try {
    const res = await fetch(API_URL + id, { signal: control.signal });
    if (!res.ok) throw new Error('PokéAPI respondió ' + res.status);
    const d = await res.json();
    return {
      id: d.id,
      name: d.name,
      image: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
      types: d.types.map((t) => t.type.name),
      height: d.height / 10,
      weight: d.weight / 10,
      abilities: d.abilities.map((a) => a.ability.name),
      stats: Object.fromEntries(d.stats.map((s) => [NOMBRES_STATS[s.stat.name] || s.stat.name, s.base_stat])),
    };
  } finally {
    clearTimeout(limite);
  }
}
