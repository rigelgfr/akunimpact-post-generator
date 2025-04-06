import React from "react";

interface ErrorOverlayProps {
  message: string;
  onCancel: () => void;
  onPasteToNewSlide: () => void;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ message, onCancel, onPasteToNewSlide }) => {
  return (
    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center z-10">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-medium text-red-600 mb-2">Unable to Add Image</h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onPasteToNewSlide}
          >
            Paste to New Slide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorOverlay;