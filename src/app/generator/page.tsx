'use client'

import { useState } from "react"

import PostForm from "@/features/post-generator/components/PostForm"
import PostCanvas from "@/features/post-generator/components/PostCanvas";
import PostPreview from "@/features/post-generator/components/PostPreview";

export default function PostGeneratorPage () {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    return (
        <div>
            <h1>Post Generator</h1>
            <div className="flex items-center justify-center mt-4">
                <PostForm />

                <div className="flex flex-col items-center justify-center bg-accent/25">
                    <PostCanvas onImageGenerated={setImageUrl} />
                    <PostPreview imageUrl={imageUrl} />
                </div>
            </div>
            
        </div>
    )
}