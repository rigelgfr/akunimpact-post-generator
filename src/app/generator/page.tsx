// page.tsx
"use client"

import { useCallback, useState } from "react"
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

    const handleFormChange = useCallback((
        postType: string,
        postCode: string,
        selectedGames: string[],
        selectedCharacters: { [key: string]: string },
        netPrice: string,
        isStarterAccount: boolean,
        postDescription: string
    ) => {
        setFormData({
            postType,
            postCode,
            selectedGames,
            selectedCharacters,
            netPrice,
            isStarterAccount,
            postDescription
        });
    }, []);

    const handleImageGenerated = (url: string | null) => {
        setImageUrl(url);
    };

    return (
        <main className="h-screen">
            <div className="flex flex-col lg:flex-row h-full">
                {/* Form section */}
                <PostForm 
                    onFormChange={handleFormChange} 
                    imageUrl={imageUrl}
                />
                
                {/* Canvas section */}
                <div className="flex-1 h-full">
                    <CanvasSpace 
                        postType={formData.postType}
                        postCode={formData.postCode}
                        selectedGames={formData.selectedGames}
                        selectedCharacters={formData.selectedCharacters}
                        netPrice={formData.netPrice}
                        isStarterAccount={formData.isStarterAccount}
                        postDescription={formData.postDescription}
                        onImageGenerated={handleImageGenerated}
                    />
                </div>
            </div>
        </main>
    )
}