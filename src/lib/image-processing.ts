import imageCompression from 'browser-image-compression';

export interface CompressedImage {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

const MAX_SIZE_MB = 1;
const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<CompressedImage> {
  const originalSize = file.size;

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported image format. Please use JPEG, PNG, WebP, or HEIC');
  }

  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: QUALITY,
  };

  try {
    let compressedBlob = await imageCompression(file, options);
    
    if (compressedBlob.size > MAX_SIZE_MB * 1024 * 1024) {
      const fileFromBlob = new File([compressedBlob], file.name, { type: 'image/webp' });
      const evenSmallerOptions = {
        ...options,
        maxSizeMB: 0.9,
        initialQuality: 0.7,
      };
      compressedBlob = await imageCompression(fileFromBlob, evenSmallerOptions);
      
      if (compressedBlob.size > MAX_SIZE_MB * 1024 * 1024) {
        const finalFileFromBlob = new File([compressedBlob], file.name, { type: 'image/webp' });
        const finalOptions = {
          ...options,
          maxSizeMB: 0.8,
          initialQuality: 0.6,
          maxWidthOrHeight: 1200,
        };
        compressedBlob = await imageCompression(finalFileFromBlob, finalOptions);
        
        if (compressedBlob.size > MAX_SIZE_MB * 1024 * 1024) {
          throw new Error('Unable to compress image to under 1MB. Please choose a smaller image.');
        }
      }
    }
    
    const finalDimensions = await getImageDimensions(compressedBlob, originalSize);
    
    if (finalDimensions.compressedSize > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`Final compressed size (${formatFileSize(finalDimensions.compressedSize)}) exceeds 1MB limit. Please choose a smaller image.`);
    }
    
    return finalDimensions;
    
  } catch (error: any) {
    console.error('Error compressing image:', error);
    throw new Error(error.message || 'Failed to compress image');
  }
}

async function getImageDimensions(blob: Blob, originalSize: number): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const previewUrl = URL.createObjectURL(blob);
    
    img.onload = () => {
      resolve({
        blob,
        previewUrl,
        width: img.width,
        height: img.height,
        originalSize,
        compressedSize: blob.size,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = previewUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function cleanupPreviewUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
