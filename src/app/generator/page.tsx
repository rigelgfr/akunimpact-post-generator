import PostForm from "@/features/post-generator/components/PostForm"

export default function PostGeneratorPage() {
    return (
        <main className="h-screen bg-canva-gray">
            <div className="h-full">
                <PostForm />
            </div>
        </main>
    )
}