'use client';

import { useState, useRef, useEffect, SyntheticEvent } from 'react';
import { Camera, Save, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper function to center the crop automatically
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function VendorSettings() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping States
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await fetch('/api/vendor/settings/profile-image');
        if (res.ok) {
          const data = await res.json();
          setProfileImage(data.profileImage);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    };
    fetchVendor();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      setError('');
      setCrop(undefined); // Reset crop
      
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      );
      reader.readAsDataURL(file);
      setIsCropping(true);
    }
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleUploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      setError('Please select a valid crop area.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      const formData = new FormData();
      formData.append('image', croppedBlob, 'profile.jpg');

      const res = await fetch('/api/vendor/settings/profile-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setProfileImage(data.profileImage);
      setMessage('Profile image updated successfully!');
      setIsCropping(false);
      setImgSrc('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Vendor Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your store profile and business details.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6 pb-4 border-b border-neutral-100">Store Profile Picture</h2>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-neutral-100 flex items-center justify-center relative">
              {profileImage ? (
                <Image src={profileImage} alt="Profile" fill className="object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-neutral-300" />
              )}
              
              {/* Overlay for hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {fetching && (
              <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-neutral-900 mb-2">Upload a new picture</h3>
            <p className="text-sm text-neutral-500 mb-4 max-w-sm">
              We recommend an image of at least 400x400px. JPG or PNG formats only. Max size 5MB. You can crop the image before saving.
            </p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            
            <button 
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                fileInputRef.current?.click();
              }}
              disabled={loading || fetching}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium py-2 px-6 rounded-lg transition-colors text-sm"
            >
              Choose Image
            </button>
          </div>
        </div>
      </div>

      {/* Cropping Modal */}
      {isCropping && !!imgSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Crop Profile Picture</h3>
              <button 
                onClick={() => {
                  setIsCropping(false);
                  setImgSrc('');
                }} 
                className="p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-neutral-100 rounded-xl flex items-center justify-center p-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-100">
              <button
                onClick={() => {
                  setIsCropping(false);
                  setImgSrc('');
                }}
                className="px-6 py-2.5 rounded-xl font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCroppedImage}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Crop & Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
