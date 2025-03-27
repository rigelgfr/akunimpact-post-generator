interface DownloadButtonProps {
    imageUrl: string | null;
  }
  
  const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl }) => {
    const downloadImage = () => {
      if (!imageUrl) return;
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "generated_post.png";
      link.click();
    };
  
    return (
      <button
        onClick={downloadImage}
        disabled={!imageUrl}
        className={`mt-4 p-2 rounded-lg shadow-md transition ${
          imageUrl ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-400 text-gray-200 cursor-not-allowed"
        }`}
      >
        Download Image
      </button>
    );
  };
  
  export default DownloadButton;
  