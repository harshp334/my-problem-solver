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
    <div className="flex items-center gap-2 p-3 rounded-lg bg-white shadow-sm">
      <div 
        className="w-20 text-center py-1 px-3 rounded font-semibold text-white text-sm"
        style={{ backgroundColor: typeColors[type] || '#777' }}
      >
        {type}
      </div>
      <span className="text-gray-600 font-medium">
        {multiplier === 0 ? 'Immune' : `${multiplier}x damage`}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Pokemon Type Analyzer
          </h1>
          <p className="text-gray-600">
            Discover what types your Pokemon is strong and weak against
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={pokemonName}
              onChange={(e) => setPokemonName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Pokemon name (e.g., pikachu, charizard)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={searchPokemon}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {pokemonData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b">
              <img 
                src={pokemonData.sprite} 
                alt={pokemonData.name}
                className="w-32 h-32 bg-gray-100 rounded-lg"
              />
              <div>
                <h2 className="text-3xl font-bold capitalize text-gray-800 mb-2">
                  {pokemonData.name}
                </h2>
                <div className="flex gap-2">
                  {pokemonData.types.map(type => (
                    <span
                      key={type}
                      className="px-4 py-1 rounded-full text-white font-semibold"
                      style={{ backgroundColor: typeColors[type] || '#777' }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="text-red-500" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">
                    Weak Against
                  </h3>
                </div>
                {pokemonData.weakTo.length > 0 ? (
                  <div className="space-y-2">
                    {pokemonData.weakTo.map(([type, multiplier]) => (
                      <TypeBadge key={type} type={type} multiplier={multiplier} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No weaknesses found!</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="text-green-500" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">
                    Resistant To
                  </h3>
                </div>
                {pokemonData.resistantTo.length > 0 ? (
                  <div className="space-y-2">
                    {pokemonData.resistantTo.map(([type, multiplier]) => (
                      <TypeBadge key={type} type={type} multiplier={multiplier} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No resistances found!</p>
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