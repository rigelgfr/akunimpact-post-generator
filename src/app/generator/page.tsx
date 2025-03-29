import PostForm from "@/features/post-generator/components/PostForm"

export default function PostGeneratorPage () {
    return (
        <main className="min-h-screens py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Post Generator</h1>
                <PostForm />
            </div>
        </main>
    )
}