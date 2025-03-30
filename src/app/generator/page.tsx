import PostForm from "@/features/post-generator/components/PostForm"

export default function PostGeneratorPage() {
    return (
        <main className="h-screen overflow-hidden">
            <div className="h-full">
                <PostForm />
            </div>
        </main>
    )
}