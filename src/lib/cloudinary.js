// Cloudinary Upload Utility
// Uses unsigned uploads with upload preset for client-side uploads

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvlhuloa0';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bbqaffair';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{url: string, publicId: string, width: number, height: number} | null>}
 */
async function uploadFileToCloudinary(file, uploadUrl, onProgress = null) {
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

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });

    return response;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

export async function uploadToCloudinary(file, onProgress = null) {
  const response = await uploadFileToCloudinary(file, UPLOAD_URL, onProgress);
  if (!response) return null;

  return {
    url: response.secure_url,
    publicId: response.public_id,
    width: response.width,
    height: response.height
  };
}

/**
 * Upload an image or video to Cloudinary (auto detects file type)
 * @param {File} file - The file to upload
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{url: string, publicId: string, width?: number, height?: number, duration?: number, resourceType: string} | null>}
 */
export async function uploadMediaToCloudinary(file, onProgress = null) {
  const mediaType = getMediaType(file);
  if (!mediaType) {
    console.error('Unsupported media type for Cloudinary upload');
    return null;
  }

  const uploadUrl = mediaType === 'video' ? VIDEO_UPLOAD_URL : UPLOAD_URL;
  const response = await uploadFileToCloudinary(file, uploadUrl, onProgress);
  if (!response) return null;

  return {
    url: response.secure_url,
    publicId: response.public_id,
    width: response.width,
    height: response.height,
    duration: response.duration,
    resourceType: mediaType
  };
}

function getMediaType(file) {
  if (!file?.type) return null;
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
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
 * Validate if a file is an acceptable image or video
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string, mediaType?: string}}
 */
export function validateMediaFile(file) {
  const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB

  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'];

  if (IMAGE_TYPES.includes(file.type)) {
    if (file.size > IMAGE_MAX_SIZE) {
      return { valid: false, error: 'Image must be less than 10MB' };
    }
    return { valid: true, mediaType: 'image' };
  }

  if (VIDEO_TYPES.includes(file.type)) {
    if (file.size > VIDEO_MAX_SIZE) {
      return { valid: false, error: 'Video must be less than 50MB' };
    }
    return { valid: true, mediaType: 'video' };
  }

  return {
    valid: false,
    error: 'Please upload a JPG, PNG, GIF, WebP, MP4, MOV, WebM, or OGG file'
  };
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
