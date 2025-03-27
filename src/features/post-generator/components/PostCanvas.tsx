import { useEffect, useRef } from "react";

interface PostCanvasProps {
  onImageGenerated: (imageUrl: string) => void;
}

const PostCanvas: React.FC<PostCanvasProps> = ({ onImageGenerated }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });
    };

    const renderCanvas = async () => {
      const images = await Promise.all([
        loadImage("/assets/post-generator/background/thumbnail_bg.webp"),
        loadImage("/assets/post-generator/game_bg/single/hsr_bg.webp"),
        loadImage("/assets/post-generator/characters/hsr/kafka/kafka_1.webp"),
        loadImage("/assets/post-generator/game_fade/single/hsr_fade.webp"),
        loadImage("/assets/post-generator/overlay/thumbnail/new/overlay_new_1.webp"),
        loadImage("/assets/post-generator/footer/footer_new.webp"),
      ]);

      images.forEach((img) => ctx.drawImage(img, 0, 0, 1080, 1350));

      // Convert canvas to image URL and pass it to the parent component
      const finalImageUrl = canvas.toDataURL("image/png");
      onImageGenerated(finalImageUrl);
    };

    renderCanvas();
  }, [onImageGenerated]);

  return <canvas ref={canvasRef} className="hidden" />;
};

export default PostCanvas;
