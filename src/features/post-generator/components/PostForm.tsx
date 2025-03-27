'use client'

import React, { useState } from 'react';
import { Characters } from '../data/characters';
import DownloadButton from '@/components/generator/DownloadButton';
import PostCanvas from './PostCanvas';

const PostForm: React.FC = () => {
  const [code, setCode] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<{ [key: string]: string }>({});
  const [netPrice, setNetPrice] = useState('');
  const [isStarterAccount, setIsStarterAccount] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Store generated image URL

  // Handle game selection
  const handleGameChange = (game: string) => {
    setSelectedGames(prev =>
      prev.includes(game)
        ? prev.filter(g => g !== game)
        : [...prev, game]
    );

    if (selectedGames.includes(game)) {
      setSelectedCharacters(prev => {
        const newChars = { ...prev };
        delete newChars[game];
        return newChars;
      });
    }
  };

  // Handle character selection
  const handleCharacterChange = (game: string, character: string) => {
    setSelectedCharacters(prev => ({
      ...prev,
      [game]: character
    }));
  };

  // Handle net price input
  const handleNetPriceChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    setNetPrice(cleanedValue ? `${cleanedValue}K` : '');
  };

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
      <PostCanvas onImageGenerated={setImageUrl} />

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

      {/* Game Selection */}
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

      {/* Character Selection */}
      {selectedGames.map((game) => (
        <div key={game}>
          <label>{game} Character:</label>
          <select
            value={selectedCharacters[game] || ''}
            onChange={(e) => handleCharacterChange(game, e.target.value)}
          >
            <option value="">Select a Character</option>
            {Object.keys(Characters[game]).map((character) => (
              <option key={character} value={character}>
                {character}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Net Price */}
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

      {/* Description */}
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

      {/* Download Button (Enabled only when image is generated) */}
      <DownloadButton imageUrl={imageUrl} />
    </form>
  );
};

export default PostForm;
