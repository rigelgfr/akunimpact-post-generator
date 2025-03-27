'use client'

import React, { useState } from 'react';

import { Characters } from '../data/characters';

const PostForm: React.FC = () => {
  // State for form fields
  const [code, setCode] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<{[key: string]: string}>({});
  const [netPrice, setNetPrice] = useState('');
  const [isStarterAccount, setIsStarterAccount] = useState(false);
  const [description, setDescription] = useState('');

  // Handle game checkbox changes
  const handleGameChange = (game: string) => {
    setSelectedGames(prev => 
      prev.includes(game) 
        ? prev.filter(g => g !== game)
        : [...prev, game]
    );
    
    // Reset characters for this game when unchecked
    if (selectedGames.includes(game)) {
      setSelectedCharacters(prev => {
        const newChars = {...prev};
        delete newChars[game];
        return newChars;
      });
    }
  };

  // Handle character selection for a specific game
  const handleCharacterChange = (game: string, character: string) => {
    setSelectedCharacters(prev => ({
      ...prev,
      [game]: character
    }));
  };

  // Validate and format net price
  const handleNetPriceChange = (value: string) => {
    // Remove any non-digit characters
    const cleanedValue = value.replace(/\D/g, '');
    
    // Append 'K' if value is not empty
    setNetPrice(cleanedValue ? `${cleanedValue}K` : '');
  };

  // Form submission handler (just logs data for now)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      code,
      selectedGames,
      selectedCharacters,
      netPrice,
      isStarterAccount,
      description
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Code Input */}
      <div>
        <label>
          Code:
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
          />
        </label>
      </div>

      {/* Game Checkboxes */}
      <div>
        <label>Select Games:</label>
        {Object.keys(Characters).map(game => (
          <label key={game}>
            <input 
              type="checkbox" 
              checked={selectedGames.includes(game)}
              onChange={() => handleGameChange(game)}
            />
            {game}
          </label>
        ))}
      </div>

    {/* Character Dropdowns (Dynamic based on selected games) */}
    {selectedGames.map((game) => (
    <div key={game}>
        <label>{game} Character:</label>
        <select
        value={selectedCharacters[game] || ''}
        onChange={(e) => handleCharacterChange(game, e.target.value)}
        >
        <option value="">Select a Character</option>
        {/* Iterate over the characters for the selected game */}
        {Object.keys(Characters[game]).map((character) => (
            <option key={character} value={character}>
            {character}
            </option>
        ))}
        </select>
    </div>
    ))}

      {/* Net Price Input */}
      <div>
        <label>
          Net Price:
          <input 
            type="text" 
            value={netPrice} 
            onChange={(e) => handleNetPriceChange(e.target.value)}
            placeholder="Enter price (e.g., 50, 1500)"
          />
        </label>
      </div>

      {/* Starter Account Checkbox */}
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={isStarterAccount}
            onChange={(e) => setIsStarterAccount(e.target.checked)}
          />
          Starter Account
        </label>
      </div>

      {/* Description Input */}
      <div>
        <label>
          Description:
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value.slice(0, 30))}
            maxLength={30}
          />
        </label>
      </div>

      {/* Submit Button */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default PostForm;