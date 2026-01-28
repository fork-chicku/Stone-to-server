
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-12 glass rounded-lg border-2 border-double border-amber-900/10 hover:border-amber-600/30 transition-all group flex flex-col items-center justify-center text-center gap-8 shadow-xl shadow-amber-900/5">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-800 group-hover:text-orange-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="space-y-3">
        <h3 className="text-3xl font-bold text-stone-800 drop-shadow-sm">Upload Ruin Imagery</h3>
        <p className="text-stone-600 italic max-w-lg mx-auto text-lg leading-relaxed">
          "Offer the broken stone to the digital pantheon, that it may be made whole again."
        </p>
      </div>
      <button
        onClick={triggerUpload}
        disabled={isLoading}
        className="px-12 py-4 bg-gradient-to-r from-orange-900 to-amber-900 hover:from-orange-800 hover:to-amber-800 disabled:from-stone-400 disabled:to-stone-500 disabled:cursor-not-allowed text-amber-50 font-bold tracking-widest uppercase text-sm rounded transition-all shadow-lg shadow-orange-900/20 active:translate-y-0.5 border border-amber-700/50"
      >
        {isLoading ? 'Consulting Sages...' : 'Select Artifact'}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
