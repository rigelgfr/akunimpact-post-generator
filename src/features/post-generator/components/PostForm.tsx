'use client'

import { useState, useEffect } from 'react';
import { Characters } from '../data/characters';
import DownloadButton from '@/components/generator/DownloadButton';
import LayeredPostCanvas from './LayeredPostCanvas';
import { useDebounce } from '@/hooks/useDebounce';

const PostForm: React.FC = () => {
    const [selectedPostType, setSelectedPostType] = useState<string>('New');
    
    // For code input
    const [codeInput, setCodeInput] = useState('');
    const code = useDebounce(codeInput, 500);
    
    const [selectedGames, setSelectedGames] = useState<string[]>([]);
    const [selectedCharacters, setSelectedCharacters] = useState<{ [key: string]: string }>({});
    
    // For net price input
    const [netPriceInput, setNetPriceInput] = useState('');
    const netPrice = useDebounce(netPriceInput, 500);
    
    const [isStarterAccount, setIsStarterAccount] = useState(false);
    
    // For description input
    const [descriptionInput, setDescriptionInput] = useState('');
    const description = useDebounce(descriptionInput, 1000);
    
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCodeChange = (value: string) => {
        const cleanedValue = value.replace(/\D/g, ''); // Remove non-numeric characters
        setCodeInput(cleanedValue);
    }

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
        setNetPriceInput(cleanedValue);
    };

    const handleDescriptionChange = (value: string) => {
        setDescriptionInput(value);
    };

    // Callback function to receive the generated image URL
    const handleImageGenerated = (url: string | null) => {
        setImageUrl(url);
        setIsGenerating(false);
    };

    // Trigger generation state when relevant inputs change
    useEffect(() => {
        setIsGenerating(true);
    }, [selectedPostType, selectedGames, selectedCharacters, netPrice, isStarterAccount, description, code]);

    return (
        <div className="flex flex-col md:flex-row w-full gap-0">
            {/* Form Section */}
            <div className="w-full md:w-1/4 bg-white p-5 border-r rounded-r-3xl border-gray-200 shadow-lg h-screen overflow-y-auto">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Configure Post</h2>
                    
                    {/* Post Type Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Post Type:</label>
                        <div className="flex space-x-4">
                            {['New', 'Drop', 'Repost'].map((type) => (
                                <label key={type} className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="postType"
                                        value={type}
                                        checked={selectedPostType === type}
                                        onChange={() => setSelectedPostType(type)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Code Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Code:
                        </label>
                        <div className="inline-flex items-center border rounded px-3 py-2 w-full max-w-xs">
                            <span className="text-gray-500 mr-2">AAA</span>
                            <input
                                type="text"
                                value={codeInput}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                className="flex-1 outline-none text-gray-800"
                                maxLength={3}
                            />
                        </div>
                    </div>

                    {/* Game Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Select Games (Max 3):</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.keys(Characters).map(game => (
                                <label key={game} className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedGames.includes(game)}
                                        onChange={() => handleGameChange(game)}
                                        disabled={!selectedGames.includes(game) && selectedGames.length >= 3}
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{game.toUpperCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Character Selection */}
                    {selectedGames.length > 0 && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Character Selection:</label>
                            {selectedGames.map((game) => (
                                <div key={game} className="flex items-center space-x-2">
                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded w-16 text-center">{game.toUpperCase()}</span>
                                    <select
                                        value={selectedCharacters[game] || ''}
                                        onChange={(e) => handleCharacterChange(game, e.target.value)}
                                        className="flex-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                        </div>
                    )}

                    {/* Net Price */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Net Price:
                        </label>
                        <div className="inline-flex items-center border rounded px-3 py-2 w-32">
                            <input
                                type="text"
                                value={netPriceInput}
                                onChange={(e) => handleNetPriceChange(e.target.value)}
                                className="w-full outline-none text-right text-gray-800"
                                maxLength={5}
                            />
                            <span className="ml-1 text-gray-500">K</span>
                        </div>
                    </div>

                    {/* Starter Account Checkbox */}
                    <div className="flex items-center">
                        <input
                            id="starter-account"
                            type="checkbox"
                            checked={isStarterAccount}
                            onChange={(e) => setIsStarterAccount(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor="starter-account" className="ml-2 block text-sm text-gray-700">
                            Starter Account
                        </label>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Description:
                        </label>
                        <textarea
                            value={descriptionInput}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            maxLength={160}
                            placeholder="Max 160 chars"
                            rows={2}
                            className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
                        />
                        <div className="text-xs text-right text-gray-500">
                            {descriptionInput.length}/160
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="pt-2">
                        {imageUrl && !isGenerating && (
                        <DownloadButton
                            imageUrl={imageUrl} // We know it's a string inside this block
                            postCode={'AAA'+code}
                        />
                        )}
                    </div>
                </form>
            </div>

            {/* Canvas Preview Section */}
            <div className="w-full md:w-3/4 bg-canva-gray flex items-center justify-center h-screen">
                <div className="p-8 flex items-center justify-center">
                    <LayeredPostCanvas 
                        postType={selectedPostType}
                        postCode={'AAA'+code}
                        selectedGames={selectedGames}
                        selectedCharacters={selectedCharacters}
                        netPrice={netPrice}
                        isStarterAccount={isStarterAccount}
                        postDescription={description.toUpperCase()}
                        onImageGenerated={handleImageGenerated}
                    />
                </div>
            </div>
        </div>
    );
};

export default PostForm;