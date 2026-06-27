import { useRef, useState } from 'react';
import { HiOutlinePhoto, HiOutlineXMark } from 'react-icons/hi2';

const MAX_BYTES = 8 * 1024 * 1024;

export default function ImageUpload({ label = 'Cover image', value, onChange, helpText, aspect = 'video' }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be 8MB or smaller');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => onChange?.(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    onChange?.('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const ratio = aspect === 'video' ? 'aspect-[16/9]' : aspect === 'square' ? 'aspect-square' : '';

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      {value ? (
        <div className={`relative ${ratio} rounded-lg overflow-hidden border border-surface-200 group`}>
          <img src={value} alt="Selected" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
          >
            <HiOutlineXMark className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`w-full ${ratio} flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-surface-200 hover:border-primary-400 hover:bg-primary-50/30 transition-colors text-surface-400 hover:text-primary-600`}
        >
          <HiOutlinePhoto className="w-8 h-8" />
          <span className="text-sm font-medium">Click or drop an image</span>
          {helpText && <span className="text-xs text-surface-400">{helpText}</span>}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
