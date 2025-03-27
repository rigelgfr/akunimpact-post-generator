interface PostPreviewProps {
    imageUrl: string | null;
  }
  
  const PostPreview: React.FC<PostPreviewProps> = ({ imageUrl }) => {
    if (!imageUrl) return null;
  
    return (
      <div className="mt-4">
        <img src={imageUrl} alt="Generated Post" className="w-[540px] h-[675px] shadow-lg" />
      </div>
    );
  };
  
  export default PostPreview;
  