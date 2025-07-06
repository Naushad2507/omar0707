import { useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Label } from './label';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSizeInMB?: number;
  placeholder?: string;
  showPreview?: boolean;
  allowCamera?: boolean;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onFileSelect,
  accept = 'image/*',
  maxSizeInMB = 5,
  placeholder = 'Upload or capture image',
  showPreview = true,
  allowCamera = true,
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      // Compress image before processing
      const compressedDataUrl = await compressImage(file);
      
      // Check compressed size (rough estimate)
      const compressedSize = (compressedDataUrl.length * 3) / 4; // Base64 to bytes
      if (compressedSize > maxSizeInMB * 1024 * 1024) {
        setError(`Image too large even after compression. Please use a smaller image.`);
        return;
      }

      // Call the onFileSelect callback if provided
      if (onFileSelect) {
        onFileSelect(file);
      }

      onChange(compressedDataUrl);
    } catch (error) {
      setError('Failed to process image');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
    // Reset the input value to allow same file selection again
    e.target.value = '';
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      // Clear any previous selection
      cameraInputRef.current.value = '';
      
      try {
        // Trigger camera immediately
        cameraInputRef.current.click();
      } catch (error) {
        console.warn('Camera access failed:', error);
        setError('Camera access not available. Please use file upload instead.');
      }
    } else {
      setError('Camera functionality not available on this device.');
    }
  };

  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    onChange(e.target.value);
  };

  const clearImage = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        {/* Image URL Input */}
        <div className="space-y-2">
          <Input
            placeholder="Enter image URL (optional)"
            value={value && !value.startsWith('data:') ? value : ''}
            onChange={handleUrlChange}
            className="w-full p-3 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs sm:text-sm text-gray-500">
            Or upload/capture an image below
            {isMobileDevice() && " (Camera available on mobile)"}
          </p>
        </div>

        {/* Upload Area */}
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            {value && showPreview ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Image uploaded successfully
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {placeholder}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to {maxSizeInMB}MB
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto py-3 text-sm sm:text-base"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  
                  {allowCamera && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCameraClick}
                      className="w-full sm:w-auto py-3 text-sm sm:text-base hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isMobileDevice() ? "Take Photo" : "Camera"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {allowCamera && (
          <>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleInputChange}
              className="hidden"
              aria-label="Take photo with camera"
              multiple={false}
            />
          </>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}