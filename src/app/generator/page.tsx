import PostEditor from "@/features/post-generator/components/PostEditor"

export default function PostGeneratorPage() {
    return (
        <main className="h-screen bg-canva-gray">
            <div className="h-full">
                <PostEditor  />
            </div>
        </main>
    )
}