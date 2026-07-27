/**
 * Storage and Image Compression Utilities for SIPATI
 * Prevents LocalStorage QuotaExceededError when saving user profile photos and team data.
 */

/**
 * Safely writes a key-value pair to LocalStorage with quota error handling.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[LocalStorage] setItem failed for "${key}" (Quota exceeded). Cleaning up cached data...`, err);
    try {
      // Clean up non-critical cached keys if storage is full
      const keysToRemove = [
        'sipati_cached_files',
        'sipati_temp_preview',
        'sipati_draft_doc',
        'sipati_temp_pdf'
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Try setting again after cleanup
      localStorage.setItem(key, value);
      console.log(`[LocalStorage] Successfully saved "${key}" after storage cleanup.`);
      return true;
    } catch (retryErr) {
      console.error(`[LocalStorage] Critical: Storage full for "${key}" even after cleanup.`, retryErr);
      return false;
    }
  }
}

/**
 * Resizes and compresses an image (File or base64 Data URL) down to a tiny size (e.g., 256x256 WebP/JPEG ~15KB).
 * This prevents multi-megabyte photo strings from blowing up LocalStorage & Firestore quotas.
 */
export function compressProfileImage(
  input: any,
  maxWidth = 256,
  maxHeight = 256,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // If it's an HTTP URL (preset avatar or external image), return as is
    if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
      resolve(input);
      return;
    }

    const img = new Image();
    // Only set crossOrigin for remote HTTP URLs
    if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }

    let rawDataUrlFallback = '';

    const processImage = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width || maxWidth;
        let height = img.height || maxHeight;

        // Calculate aspect ratio fit
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrlFallback || (typeof input === 'string' ? input : ''));
          return;
        }

        // Draw background white for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress to JPEG data URL
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        if (!compressedDataUrl || compressedDataUrl.length < 50) {
          compressedDataUrl = rawDataUrlFallback || (typeof input === 'string' ? input : '');
        }

        console.log(
          `[ImageCompressor] Image compressed down to ${Math.round(compressedDataUrl.length / 1024)} KB.`
        );
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('[ImageCompressor] Canvas compression failed, falling back to raw:', err);
        resolve(rawDataUrlFallback || (typeof input === 'string' ? input : ''));
      }
    };

    img.onload = processImage;
    img.onerror = (e) => {
      console.warn('[ImageCompressor] Image onload error, using fallback:', e);
      resolve(rawDataUrlFallback || (typeof input === 'string' ? input : ''));
    };

    if (typeof input === 'string') {
      rawDataUrlFallback = input;
      img.src = input;
    } else if (input instanceof File || input instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result as string;
        rawDataUrlFallback = res || '';
        if (res) {
          img.src = res;
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(input);
    } else {
      resolve('');
    }
  });
}

/**
 * Resizes and compresses a banner image (File or base64 Data URL) maintaining crisp aspect ratio.
 * Default max dimensions (900x400 at 0.80 quality) keep files ~40-60KB each.
 */
export function compressBannerImage(
  input: any,
  maxWidth = 900,
  maxHeight = 400,
  quality = 0.80
): Promise<string> {
  return compressProfileImage(input, maxWidth, maxHeight, quality);
}

