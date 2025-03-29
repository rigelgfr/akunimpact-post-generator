'use client'

import { useState, useEffect } from 'react';
import { Characters } from '../data/characters';
import DownloadButton from '@/components/generator/DownloadButton';
import LayeredPostCanvas from './LayeredPostCanvas';

const PostForm: React.FC = () => {
    const [selectedPostType, setSelectedPostType] = useState<string>('New');
    const [code, setCode] = useState('');
    const [selectedGames, setSelectedGames] = useState<string[]>([]);
    const [selectedCharacters, setSelectedCharacters] = useState<{ [key: string]: string }>({});
    const [netPrice, setNetPrice] = useState('');
    const [isStarterAccount, setIsStarterAccount] = useState(false);
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGameChange = (game: string) => {
        const isCurrentlySelected = selectedGames.includes(game);
        let newSelectedGames: string[];

        if (isCurrentlySelected) {
            newSelectedGames = selectedGames.filter(g => g !== game);
            // Remove character selection for the deselected game
            setSelectedCharacters(prev => {
                const newChars = { ...prev };
                delete newChars[game];
                return newChars;
            });
        } else {
            // Limit selection if needed (e.g., max 3 games)
            if (selectedGames.length < 3) {
                 newSelectedGames = [...selectedGames, game];
            } else {
                // Optionally provide feedback that max games reached
                console.warn("Maximum number of games selected");
                return; // Prevent adding more than 3
            }
        }
         setSelectedGames(newSelectedGames);
    };

    const handleCharacterChange = (game: string, character: string) => {
        setSelectedCharacters(prev => ({
            ...prev,
            [game]: character
        }));
    };

    const handleNetPriceChange = (value: string) => {
        const cleanedValue = value.replace(/\D/g, ''); // Remove non-numeric characters
        setNetPrice(cleanedValue); // Store only numeric part
    };

    // Callback function to receive the generated image URL
    const handleImageGenerated = (url: string | null) => {
        setImageUrl(url);
        setIsGenerating(false);
    };

    // Trigger generation state when relevant inputs change
    useEffect(() => {
        setIsGenerating(true);
    }, [selectedPostType, selectedGames, selectedCharacters, netPrice, isStarterAccount]);

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <form onSubmit={(e) => e.preventDefault()} style={{ flex: 1 }}>
                <h2>Configure Post</h2>
                {/* Post Type Selection */}
                <div>
                    <label>Post Type:</label>
                    <div>
                        {['New', 'Drop', 'Repost'].map((type) => (
                            <label key={type} style={{ marginRight: '10px' }}>
                                <input
                                    type="radio"
                                    name="postType"
                                    value={type}
                                    checked={selectedPostType === type}
                                    onChange={() => setSelectedPostType(type)}
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Code Input */}
                 <div>
                    <label>
                        Code:
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{ marginLeft: '5px' }}
                         />
                    </label>
                </div>

                {/* Game Selection */}
                 <div>
                    <label>Select Games (Max 3):</label>
                    <div>
                        {Object.keys(Characters).map(game => (
                            <label key={game} style={{ marginRight: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedGames.includes(game)}
                                    onChange={() => handleGameChange(game)}
                                    disabled={!selectedGames.includes(game) && selectedGames.length >= 3}
                                />
                                {game.toUpperCase()}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Character Selection */}
                {selectedGames.map((game) => (
                    <div key={game}>
                        <label>{game.toUpperCase()} Character:</label>
                        <select
                            value={selectedCharacters[game] || ''}
                            onChange={(e) => handleCharacterChange(game, e.target.value)}
                            style={{ marginLeft: '5px' }}
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
                        <div className="inline-flex items-center">
                            <input
                                type="text"
                                value={netPrice}
                                onChange={(e) => handleNetPriceChange(e.target.value)}
                                style={{ width: '60px', textAlign: 'right' }} // Fixed width for "xxxx"
                            />
                            <span className='ml-1'>K</span>
                        </div>
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
                            placeholder="Max 30 chars"
                            style={{ marginLeft: '5px', width: '200px' }}
                        />
                    </label>
                </div>

                {/* Download Button */}
                <DownloadButton imageUrl={imageUrl} />
                {isGenerating && <p>Generating preview...</p>}
            </form>

            {/* Using the new layered canvas component */}
            <LayeredPostCanvas 
                postType={selectedPostType}
                selectedGames={selectedGames}
                selectedCharacters={selectedCharacters}
                netPrice={netPrice}
                isStarterAccount={isStarterAccount}
                onImageGenerated={handleImageGenerated}
            />
        </div>
    );
};

export default PostForm;