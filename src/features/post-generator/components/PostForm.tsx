'use client'

import React, { useState } from 'react';
import { Characters } from '../data/characters'; // Adjust path
import DownloadButton from '@/components/generator/DownloadButton';
import PostCanvas from './PostCanvas';

const PostForm: React.FC = () => {
    // ... (Keep existing state variables: selectedPostType, code, etc.) ...
    const [selectedPostType, setSelectedPostType] = useState<string>('New');
    const [code, setCode] = useState('');
    const [selectedGames, setSelectedGames] = useState<string[]>([]);
    const [selectedCharacters, setSelectedCharacters] = useState<{ [key: string]: string }>({});
    const [netPrice, setNetPrice] = useState('');
    const [isStarterAccount, setIsStarterAccount] = useState(false);
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null); // State to hold the generated image URL
    const [isGenerating, setIsGenerating] = useState(false); // Optional: for loading state

    // ... (Keep existing handlers: handleGameChange, handleCharacterChange, etc.) ...
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
        const cleanedValue = value.replace(/\D/g, '');
        setNetPrice(cleanedValue ? `${cleanedValue}K` : '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // You might want to trigger final generation here if needed,
        // or just log the state which is already used for the preview
        console.log("Form Submitted State:", {
            postType: selectedPostType,
            code,
            selectedGames,
            selectedCharacters,
            netPrice,
            isStarterAccount,
            description,
            generatedImageUrl: imageUrl // Log the generated URL too
        });
        // Potentially trigger download using the imageUrl if ready
    };

    // Callback function to receive the generated image URL
    const handleImageGenerated = (url: string | null) => {
        setImageUrl(url);
        setIsGenerating(false); // Generation finished
         console.log("Image Updated:", url ? url.substring(0, 100) + '...' : 'Error/Empty'); // Log truncated URL
    };

    // Trigger generation state when relevant inputs change
    // Use a debounce mechanism here in a real app to avoid excessive re-renders
    React.useEffect(() => {
        setIsGenerating(true);
        // Simple immediate trigger; consider debounce for performance
    }, [selectedPostType, selectedGames, selectedCharacters /*, other relevant state */]);


    return (
        <div style={{ display: 'flex', gap: '20px' }}> {/* Basic layout */}
            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
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
                                    disabled={!selectedGames.includes(game) && selectedGames.length >= 3} // Disable adding more than 3
                                />
                                {game.toUpperCase()} {/* Display game names consistently */}
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
                        <input
                            type="text"
                            value={netPrice}
                            onChange={(e) => handleNetPriceChange(e.target.value)}
                            placeholder="e.g., 50, 1500"
                             style={{ marginLeft: '5px' }}
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
                            placeholder="Max 30 chars"
                            style={{ marginLeft: '5px', width: '200px' }}
                        />
                    </label>
                </div>

                {/* Download Button - Disabled while generating or if no image */}
                <DownloadButton imageUrl={imageUrl} />
                {isGenerating && <p>Generating preview...</p>}
            </form>
        </div>
    );
};

export default PostForm;