import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Image
        src="/logo/logo.png"
        alt="Vercel Logo"
        width={72}
        height={16}
      />
    </div>
  );
}
