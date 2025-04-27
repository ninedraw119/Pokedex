const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('type-filter');
const generationFilter = document.getElementById('generation-filter');
const regionFilter = document.getElementById('region-filter');
const minWeight = document.getElementById('min-weight');
const maxWeight = document.getElementById('max-weight');
const minHeight = document.getElementById('min-height');
const maxHeight = document.getElementById('max-height');
const detailsScreen = document.getElementById('details-screen');
const closeDetails = document.getElementById('close-details');

let allPokemon = [];

const fetchPokemons = async () => {
  const url = 'https://pokeapi.co/api/v2/pokemon?limit=898'; // Até a 8ª geração
  const res = await fetch(url);
  const data = await res.json();
  const pokemons = data.results;

  for (let i = 0; i < pokemons.length; i++) {
    const pokeData = await fetchPokemonData(i + 1);
    allPokemon.push(pokeData);
    createPokemonCard(pokeData);
  }
  populateTypeFilter();
};

const fetchPokemonData = async (id) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const createPokemonCard = (pokemon) => {
  const card = document.createElement('div');
  card.classList.add('pokemon-card');
  card.setAttribute('data-types', pokemon.types.map(t => t.type.name).join(','));
  card.setAttribute('data-generation', getGeneration(pokemon.id));
  card.setAttribute('data-region', getRegion(pokemon.id));
  card.setAttribute('data-weight', pokemon.weight / 10);
  card.setAttribute('data-height', pokemon.height / 10);
  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h4>#${pokemon.id} ${capitalize(pokemon.name)}</h4>
  `;
  card.addEventListener('click', () => showPokemonDetails(pokemon));
  pokedex.appendChild(card);
};

const showPokemonDetails = (pokemon) => {
  document.getElementById('pokemon-name').textContent = `#${pokemon.id} ${capitalize(pokemon.name)}`;
  document.getElementById('pokemon-image').src = pokemon.sprites.front_default;
  document.getElementById('pokemon-info').innerHTML = `
    <p><strong>Tipos:</strong> ${pokemon.types.map(t => capitalize(t.type.name)).join(', ')}</p>
    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
    <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => capitalize(a.ability.name)).join(', ')}</p>
  `;
  fetchEvolutionLine(pokemon.species.url);
  detailsScreen.classList.remove('hidden');
};

const fetchEvolutionLine = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  const evolutionChainUrl = data.evolution_chain.url;
  const evolutionData = await fetch(evolutionChainUrl);
  const evolution = await evolutionData.json();

  let evolutionLine = `<h4>Linhas Evolutivas:</h4>`;
  let currentEvolution = evolution.chain;
  
  while (currentEvolution) {
    evolutionLine += `<p>${capitalize(currentEvolution.species.name)}</p>`;
    currentEvolution = currentEvolution.evolves_to[0];
  }

  document.getElementById('pokemon-evolution').innerHTML = evolutionLine;
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

closeDetails.addEventListener('click', () => {
  detailsScreen.classList.add('hidden');
});

searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);
generationFilter.addEventListener('change', applyFilters);
regionFilter.addEventListener('change', applyFilters);
minWeight.addEventListener('input', applyFilters);
maxWeight.addEventListener('input', applyFilters);
minHeight.addEventListener('input', applyFilters);
maxHeight.addEventListener('input', applyFilters);

function applyFilters() {
  const searchValue = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;
  const selectedGeneration = generationFilter.value;
  const selectedRegion = regionFilter.value;
  const minW = minWeight.value;
  const maxW = maxWeight.value;
  const minH = minHeight.value;
  const maxH = maxHeight.value;

  const cards = document.querySelectorAll('.pokemon-card');
  cards.forEach(card => {
    const name = card.querySelector('h4').textContent.toLowerCase();
    const types = card.getAttribute('data-types');
    const generation = card.getAttribute('data-generation');
    const region = card.getAttribute('data-region');
    const weight = card.getAttribute('data-weight');
    const height = card.getAttribute('data-height');

    const matchesSearch = name.includes(searchValue);
    const matchesType = selectedType ? types.includes(selectedType) : true;
    const matchesGeneration = selectedGeneration ? generation === selectedGeneration : true;
    const matchesRegion = selectedRegion ? region === selectedRegion : true;
    const matchesWeight = (minW ? weight >= minW : true) && (maxW ? weight <= maxW : true);
    const matchesHeight = (minH ? height >= minH : true) && (maxH ? height <= maxH : true);

    if (matchesSearch && matchesType && matchesGeneration && matchesRegion && matchesWeight && matchesHeight) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function getGeneration(id) {
  if (id <= 151) return "1";
  if (id <= 251) return "2";
  if (id <= 386) return "3";
  if (id <= 493) return "4";
  if (id <= 649) return "5";
  if (id <= 721) return "6";
  if (id <= 809) return "7";
  if (id <= 898) return "8";
  return "unknown";
}

function getRegion(id) {
  if (id <= 151) return "kanto";
  if (id <= 251) return "johto";
  if (id <= 386) return "hoenn";
  if (id <= 493) return "sinnoh";
  if (id <= 649) return "unova";
  if (id <= 721) return "kalos";
  if (id <= 809) return "alola";
  if (id <= 898) return "galar";
  return "unknown";
}

function populateTypeFilter() {
  fetch('https://pokeapi.co/api/v2/type')
    .then(res => res.json())
    .then(data => {
      data.results.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = capitalize(type.name);
        typeFilter.appendChild(option);
      });
    });
}

fetchPokemons();
