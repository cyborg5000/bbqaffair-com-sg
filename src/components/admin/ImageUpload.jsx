import { useState, useRef } from 'react';
import { uploadToCloudinary, validateImageFile } from '../../lib/cloudinary';
import { Upload, X, Image, Loader2 } from 'lucide-react';

export default function ImageUpload({ value, onChange, label = 'Product Image' }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setError('');

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Upload to Cloudinary
    setUploading(true);
    setProgress(0);

    const result = await uploadToCloudinary(file, (percent) => {
      setProgress(percent);
    });

    setUploading(false);

    if (result) {
      onChange(result.url);
    } else {
      setError('Upload failed. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="form-group">
      <label>{label}</label>

      <div className="image-upload-container">
        {/* Preview or Dropzone */}
        {value ? (
          <div className="image-preview">
            <img src={value} alt="Preview" />
            <button
              type="button"
              className="image-remove-btn"
              onClick={handleClear}
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className={`image-dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
          >
            {uploading ? (
              <div className="upload-progress">
                <Loader2 size={32} className="spinner" />
                <span>Uploading... {progress}%</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <>
                <Upload size={32} />
                <span>Click or drag image to upload</span>
                <span className="upload-hint">JPG, PNG, GIF, WebP (max 10MB)</span>
              </>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleInputChange}
          className="hidden-input"
        />

        {/* Error message */}
        {error && (
          <div className="upload-error">
            {error}
          </div>
        )}

        {/* URL input for manual entry (optional fallback) */}
        {!value && !uploading && (
          <div className="url-fallback">
            <span className="url-divider">or paste image URL</span>
            <input
              type="url"
              placeholder="https://..."
              onChange={(e) => onChange(e.target.value)}
              className="url-input"
            />
          </div>
        )}
      </div>
    </div>
  );
}
