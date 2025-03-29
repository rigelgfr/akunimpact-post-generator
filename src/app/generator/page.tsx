'use client'

import { useState } from "react"

import PostForm from "@/features/post-generator/components/PostForm"
import PostPreview from "@/features/post-generator/components/PostPreview";

export default function PostGeneratorPage () {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    return (
        <div className="flex items-center justify-center mt-4">
            <PostForm />

            <div className="flex flex-col items-center justify-center bg-accent/25">
                <PostPreview imageUrl={imageUrl} />
            </div>
        </div>
    )
}