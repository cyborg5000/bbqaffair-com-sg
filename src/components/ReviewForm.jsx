import { useState, useRef, useEffect } from 'react';
import { Upload, X, Send, Loader2, Star } from 'lucide-react';
import { uploadMediaToCloudinary, validateMediaFile } from '../lib/cloudinary';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dndpcnyiqrtjfefpnqho.supabase.co';

function ReviewForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: '5',
    review: ''
  });
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitState, setSubmitState] = useState('idle');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (submitState === 'success') {
      const timer = setTimeout(() => setSubmitState('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitState]);

  const handleChange = (e) => {
    if (formError) {
      setFormError('');
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = async (file) => {
    setUploadError('');

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setProgress(0);

    const result = await uploadMediaToCloudinary(file, (percent) => {
      setProgress(percent);
    }, { folder: 'bbqaffair/reviews' });

    setUploading(false);

    if (result) {
      setMedia({
        url: result.url,
        publicId: result.publicId,
        resourceType: result.resourceType,
        width: result.width,
        height: result.height,
        duration: result.duration,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size
      });
    } else {
      setUploadError('Upload failed. Please try again.');
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

  const handleClearMedia = () => {
    setMedia(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter your name.');
      return;
    }

    if (!formData.review.trim()) {
      setFormError('Please share your review.');
      return;
    }

    if (uploading) {
      setFormError('Please wait for the upload to finish.');
      return;
    }

    setSubmitState('submitting');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        rating: Number(formData.rating || 5),
        review: formData.review.trim(),
        media: media || null
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'submit-review',
          ...payload
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Submission failed');
      }

      setFormData({
        name: '',
        email: '',
        rating: '5',
        review: ''
      });
      setMedia(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFormError('');
      setSubmitState('success');
    } catch (submitError) {
      console.error('Review submission failed:', submitError);
      setFormError('Failed to submit review. Please try again.');
      setSubmitState('idle');
    }
  };

  return (
    <section className="contact-section review-section" id="review">
      <div className="contact-header">
        <span className="contact-tagline">Share Your Experience</span>
        <h2 className="section-title">Leave a Review</h2>
        <p className="section-subtitle">
          Your feedback helps us serve better BBQ experiences across Singapore.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info review-info">
          <h3 className="contact-info-title">What to Include</h3>
          <div className="review-highlight">
            <p>Tell us about the food, service, and overall vibe.</p>
          </div>
          <ul className="review-list">
            <li>Event type and guest count</li>
            <li>Favorite dishes</li>
            <li>Any standout moments</li>
          </ul>
          <div className="review-note">
            We may feature your review on our website or social media.
          </div>
        </div>

        <form className="contact-form review-form" onSubmit={handleSubmit}>
          <h3 className="form-title">Customer Review</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Jane Tan"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Rating *</label>
            <div className="rating-select">
              <Star size={18} />
              <select name="rating" value={formData.rating} onChange={handleChange}>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Great</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Okay</option>
                <option value="1">1 - Needs Improvement</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              name="review"
              rows="5"
              value={formData.review}
              onChange={handleChange}
              required
              placeholder="Share your BBQ Affair experience..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Photo or Video (Optional)</label>
            <div className="image-upload-container">
              {media ? (
                <div className="image-preview media-preview">
                  {media.resourceType === 'video' ? (
                    <video controls src={media.url} />
                  ) : (
                    <img src={media.url} alt="Review upload preview" />
                  )}
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={handleClearMedia}
                    title="Remove media"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className={`image-dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                  onClick={handleClickUpload}
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
                      <span>Click or drag photo/video to upload</span>
                      <span className="upload-hint">JPG, PNG, WebP, MP4, MOV (max 50MB for video)</span>
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm,video/ogg"
                onChange={handleInputChange}
                className="hidden-input"
              />

              {uploadError && (
                <div className="upload-error">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={submitState === 'submitting' || uploading}
          >
            {submitState === 'submitting' ? (
              <>
                <Loader2 size={18} className="spinner" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Review
              </>
            )}
          </button>

          {submitState === 'success' && (
            <div className="review-success">
              Thanks! Your review has been sent to our team.
            </div>
          )}
          {formError && (
            <div className="upload-error" style={{ marginTop: '1rem' }}>
              {formError}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default ReviewForm;
