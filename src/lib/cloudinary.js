// Cloudinary Upload Utility
// Uses unsigned uploads with upload preset for client-side uploads

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvlhuloa0';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bbqaffair';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{url: string, publicId: string, width: number, height: number} | null>}
 */
export async function uploadToCloudinary(file, onProgress = null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', UPLOAD_URL);
      xhr.send(formData);
    });

    return {
      url: response.secure_url,
      publicId: response.public_id,
      width: response.width,
      height: response.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

/**
 * Validate if a file is an acceptable image
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file) {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a JPG, PNG, GIF, or WebP image'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'Image must be less than 10MB'
    };
  }

  return { valid: true };
}

/**
 * Get a Cloudinary URL with transformations
 * @param {string} url - The original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string}
 */
export function getTransformedUrl(url, { width, height, quality = 'auto', format = 'auto' } = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const transforms = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  // Insert transformations into URL
  // URL format: https://res.cloudinary.com/{cloud}/image/upload/{transforms}/v{version}/{publicId}
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
