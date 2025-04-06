import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-2">
      <Image
        src="/logo/logo.png"
        alt="Vercel Logo"
        width={100}
        height={100}
      />

      <div className="flex items-center justify-center gap-2">
        <Button>
          <Link href="/generator">Create a post</Link>
        </Button>

        <Button>
          <Link href="/detector">Test the model</Link>
        </Button>
      </div>
    </div>
  );
}