import React, { useState } from 'react';
import { Search, Shield, Zap, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const typeColors = {
    normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
    poison: '#A040A0', ground: '#E0C068', rock: '#B8A038',
    bug: '#A8B820', ghost: '#705898', steel: '#B8B8D0',
    fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8',
    dragon: '#7038F8', dark: '#705848', fairy: '#EE99AC'
  };

  const calculateTypeEffectiveness = (types) => {
    const effectiveness = {};
    
    types.forEach(typeInfo => {
      typeInfo.damage_relations.double_damage_from.forEach(type => {
        effectiveness[type.name] = (effectiveness[type.name] || 1) * 2;
      });
      typeInfo.damage_relations.half_damage_from.forEach(type => {
        effectiveness[type.name] = (effectiveness[type.name] || 1) * 0.5;
      });
      typeInfo.damage_relations.no_damage_from.forEach(type => {
        effectiveness[type.name] = 0;
      });
    });

    return effectiveness;
  };

  const searchPokemon = async () => {
    if (!pokemonName.trim()) return;
    
    setLoading(true);
    setError(null);
    setPokemonData(null);

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase().trim()}`
      );
      
      if (!response.ok) {
        throw new Error('Pokemon not found! Check the spelling and try again.');
      }
      
      const data = await response.json();
      
      const typeDetailsPromises = data.types.map(t => 
        fetch(t.type.url).then(r => r.json())
      );
      
      const typeDetails = await Promise.all(typeDetailsPromises);
      
      const effectiveness = calculateTypeEffectiveness(typeDetails);
      
      const weakTo = Object.entries(effectiveness)
        .filter(([_, val]) => val > 1)
        .sort((a, b) => b[1] - a[1]);
      
      const resistantTo = Object.entries(effectiveness)
        .filter(([_, val]) => val < 1)
        .sort((a, b) => a[1] - b[1]);

      setPokemonData({
        name: data.name,
        sprite: data.sprites.front_default,
        types: data.types.map(t => t.type.name),
        weakTo,
        resistantTo
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchPokemon();
    }
  };

  const TypeBadge = ({ type, multiplier }) => (
    <div className="type-item">
      <div 
        className="type-name"
        style={{ backgroundColor: typeColors[type] || '#777' }}
      >
        {type}
      </div>
      <span className="type-multiplier">
        {multiplier === 0 ? 'Immune' : `${multiplier}x damage`}
      </span>
    </div>
  );

  return (
    <div className="app-container">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Pokemon Type Analyzer
          </h1>
          <p className="subtitle">
            Discover what types your Pokemon is strong and weak against
          </p>
        </div>

        <div className="search-container">
          <div className="search-form">
            <input
              type="text"
              value={pokemonName}
              onChange={(e) => setPokemonName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Pokemon name (e.g., pikachu, charizard)"
              className="search-input"
            />
            <button
              onClick={searchPokemon}
              disabled={loading}
              className="search-button"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle className="text-red-500" size={24} />
            <p className="error-text">{error}</p>
          </div>
        )}

        {pokemonData && (
          <div className="pokemon-card">
            <div className="pokemon-header">
              <img 
                src={pokemonData.sprite} 
                alt={pokemonData.name}
                className="pokemon-image"
              />
              <div>
                <h2 className="pokemon-name">
                  {pokemonData.name}
                </h2>
                <div className="type-badges">
                  {pokemonData.types.map(type => (
                    <span
                      key={type}
                      className="type-badge"
                      style={{ backgroundColor: typeColors[type] || '#777' }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div>
                <div className="stats-header">
                  <Zap className="text-red-500" size={24} />
                  <h3 className="stats-title">
                    Weak Against
                  </h3>
                </div>
                {pokemonData.weakTo.length > 0 ? (
                  <div className="stats-section">
                    {pokemonData.weakTo.map(([type, multiplier]) => (
                      <TypeBadge key={type} type={type} multiplier={multiplier} />
                    ))}
                  </div>
                ) : (
                  <p className="no-results">No weaknesses found!</p>
                )}
              </div>

              <div>
                <div className="stats-header">
                  <Shield className="text-green-500" size={24} />
                  <h3 className="stats-title">
                    Resistant To
                  </h3>
                </div>
                {pokemonData.resistantTo.length > 0 ? (
                  <div className="stats-section">
                    {pokemonData.resistantTo.map(([type, multiplier]) => (
                      <TypeBadge key={type} type={type} multiplier={multiplier} />
                    ))}
                  </div>
                ) : (
                  <p className="no-results">No resistances found!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;