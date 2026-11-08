import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, Trash2, RefreshCw, AlertCircle, HardDrive } from 'lucide-react';
import { readDeviceImageFile, formatFileSize } from '../../utils/imageUpload';

interface DeviceImageUploaderProps {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  required?: boolean;
  helpText?: string;
  previewHeightClass?: string;
}

export const DeviceImageUploader: React.FC<DeviceImageUploaderProps> = ({
  label,
  value,
  onChange,
  required = false,
  helpText = 'Select an image file directly from your computer or phone storage (JPG, PNG, WebP).',
  previewHeightClass = 'h-44',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const result = await readDeviceImageFile(file, 1600, 0.85);
      onChange(result.dataUrl);
      setUploadedFileInfo({
        name: result.name,
        size: result.size,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process image file from your device.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUploadedFileInfo(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = Boolean(value && value.trim());

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hasImage && (
          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Image Attached</span>
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {hasImage ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group shadow-xs">
          <img
            src={value}
            alt="Preview"
            className={`w-full ${previewHeightClass} object-cover transition-opacity group-hover:opacity-90`}
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-between p-3">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                <HardDrive className="w-3 h-3" />
                <span>Uploaded from Device</span>
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors shadow-xs"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-end justify-between text-white">
              <div className="text-xs truncate max-w-[70%]">
                <p className="font-semibold truncate text-[11px] text-white">
                  {uploadedFileInfo?.name || 'Selected Device Photo'}
                </p>
                {uploadedFileInfo && (
                  <p className="text-[10px] text-slate-300">
                    Optimized: {formatFileSize(uploadedFileInfo.size)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-800" />
                ) : (
                  <RefreshCw className="w-3 h-3 text-emerald-800" />
                )}
                <span>Change Image</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-emerald-600 bg-slate-50/70 hover:bg-emerald-50/30'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-2xs">
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isProcessing ? 'Processing image from device...' : 'Click to Upload from Device Storage'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supports device file picker, camera roll, and drag-and-drop
            </p>
          </div>
          <button
            type="button"
            className="mt-1 px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Browse Device Files</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {helpText && !errorMessage && (
        <p className="text-[11px] text-slate-500">{helpText}</p>
      )}
    </div>
  );
};
