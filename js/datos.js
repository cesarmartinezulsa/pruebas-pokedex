const TOTAL = 151;
const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
const STORAGE_KEY = 'pokemonCapturados';

const COLOR_TIPO = {
  normal: '#C9C9B8', fire: '#F5A25D', water: '#6CB4F0', electric: '#F7D54A',
  grass: '#7ED48C', ice: '#A6E3E9', fighting: '#E06C5E', poison: '#C98BE0',
  ground: '#DDBE7A', flying: '#B8A8F0', psychic: '#F58BB0', bug: '#BCD35C',
  rock: '#C4B26A', ghost: '#A08BBE', dragon: '#8F7AF0', dark: '#9C8577',
  steel: '#B8B8D0', fairy: '#F4B8D0',
};

const EMOJI_TIPO = {
  electric: '⚡', fire: '🔥', water: '💧', grass: '🌿', ice: '❄️',
  ghost: '👻', dragon: '🐉', psychic: '🔮',
};

const NOMBRES_ESPECIALES = {
  'nidoran-f': 'Nidoran ♀',
  'nidoran-m': 'Nidoran ♂',
  'mr-mime': 'Mr. Mime',
  farfetchd: "Farfetch'd",
};

const NOMBRES_STATS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

const MENSAJES = {
  repetido: 'Este Pokémon ya había sido capturado.',
  invalido: 'Este código QR no pertenece a la Pokédex.',
  conexion: 'No fue posible consultar la información del Pokémon.',
  ilegible: 'No se pudo leer el código QR. Intenta de nuevo.',
  guardado: 'No se pudo guardar el Pokémon en este dispositivo.',
};
