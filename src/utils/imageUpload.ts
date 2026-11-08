/**
 * Utility to process and optimize image files uploaded directly from device storage.
 * Reads the file, downscales large photos to a max dimension to preserve memory and disk space,
 * and produces a crisp, production-ready base64 Data URL.
 */
export async function readDeviceImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ dataUrl: string; name: string; size: number; originalSize: number }> {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image. Please choose an image from your device (JPG, PNG, WebP, etc.).');
  }

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from your device storage.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const img = new Image();
        img.onerror = () => {
          resolve({ dataUrl: rawDataUrl, name: file.name, size: file.size, originalSize });
        };
        img.onload = () => {
          try {
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve({ dataUrl: rawDataUrl, name: file.name, size: file.size, originalSize });
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const isPng = file.type === 'image/png';
            const outputMime = isPng ? 'image/png' : 'image/jpeg';
            const compressedDataUrl = canvas.toDataURL(outputMime, isPng ? undefined : quality);
            const approxSize = Math.round((compressedDataUrl.length * 3) / 4);

            resolve({
              dataUrl: compressedDataUrl,
              name: file.name,
              size: approxSize,
              originalSize,
            });
          } catch {
            resolve({ dataUrl: rawDataUrl, name: file.name, size: file.size, originalSize });
          }
        };
        img.src = rawDataUrl;
      } else {
        resolve({ dataUrl: rawDataUrl, name: file.name, size: file.size, originalSize });
      }
    };
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
