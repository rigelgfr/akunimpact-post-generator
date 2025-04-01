// page.tsx
"use client"

import { useState } from "react"
import PostForm from "@/features/post-generator/components/PostForm"
import CanvasSpace from "@/features/post-generator/components/CanvasSpace"

export default function PostGeneratorPage() {
    const [formData, setFormData] = useState({
        postType: "New",
        postCode: "AAA",
        selectedGames: [] as string[],
        selectedCharacters: {} as { [key: string]: string },
        netPrice: "",
        isStarterAccount: false,
        postDescription: ""
    });

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleFormChange = (
        postType: string,
        postCode: string,
        selectedGames: string[],
        selectedCharacters: { [key: string]: string },
        netPrice: string,
        isStarterAccount: boolean,
        postDescription: string
    ) => {
        // Check if the new data is different from current state before updating
        setFormData(prevData => {
        // Skip update if data hasn't changed
        if (
            prevData.postType === postType &&
            prevData.postCode === postCode &&
            JSON.stringify(prevData.selectedGames) === JSON.stringify(selectedGames) &&
            JSON.stringify(prevData.selectedCharacters) === JSON.stringify(selectedCharacters) &&
            prevData.netPrice === netPrice &&
            prevData.isStarterAccount === isStarterAccount &&
            prevData.postDescription === postDescription
        ) {
            return prevData; // Return previous state to avoid re-render
        }
        
        // Only update if something changed
        return {
            postType,
            postCode,
            selectedGames,
            selectedCharacters,
            netPrice,
            isStarterAccount,
            postDescription
        };
        });
    };

    const handleImageGenerated = (url: string | null) => {
        setImageUrl(url);
    };

    return (
        <main className="h-screen bg-canva-gray">
        <div className="flex h-full">
            <PostForm 
            onFormChange={handleFormChange} 
            imageUrl={imageUrl} // Pass imageUrl to PostForm
            />
            
            <CanvasSpace 
            postType={formData.postType}
            postCode={formData.postCode}
            selectedGames={formData.selectedGames}
            selectedCharacters={formData.selectedCharacters}
            netPrice={formData.netPrice}
            isStarterAccount={formData.isStarterAccount}
            postDescription={formData.postDescription}
            onImageGenerated={handleImageGenerated} // Add this prop
            />
        </div>
        </main>
    )
}