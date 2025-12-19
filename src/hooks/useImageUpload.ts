import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, generateUniqueFilename, isValidImageType, isWithinSizeLimit, formatBytes } from '@/lib/imageCompression';
import { useToast } from '@/hooks/use-toast';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  compressedSize?: number;
}

interface UseImageUploadOptions {
  userId: string;
  maxImages?: number;
  maxFileSizeMB?: number;
}

interface UseImageUploadReturn {
  images: UploadedImage[];
  isUploading: boolean;
  uploadProgress: number;
  uploadImages: (files: FileList | File[]) => Promise<void>;
  removeImage: (id: string) => void;
  reorderImages: (startIndex: number, endIndex: number) => void;
  setImages: (images: UploadedImage[]) => void;
}

export function useImageUpload({
  userId,
  maxImages = 20,
  maxFileSizeMB = 10,
}: UseImageUploadOptions): UseImageUploadReturn {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadImages = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max images limit
    if (images.length + fileArray.length > maxImages) {
      toast({
        variant: 'destructive',
        title: 'Too many images',
        description: `Maximum ${maxImages} images allowed`,
      });
      return;
    }

    // Validate files
    const validFiles = fileArray.filter(file => {
      if (!isValidImageType(file)) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: `${file.name} is not a valid image`,
        });
        return false;
      }
      if (!isWithinSizeLimit(file, maxFileSizeMB)) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: `${file.name} exceeds ${maxFileSizeMB}MB limit`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedImages: UploadedImage[] = [];
    let completedCount = 0;

    for (const file of validFiles) {
      try {
        // Compress the image
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          type: 'image/webp',
        });

        // Generate unique filename
        const filename = generateUniqueFilename(file.name, 'webp');
        const filePath = `${userId}/${filename}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, compressed.blob, {
            contentType: 'image/webp',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        uploadedImages.push({
          id: crypto.randomUUID(),
          url: publicUrl,
          name: file.name,
          size: file.size,
          compressedSize: compressed.compressedSize,
        });

        completedCount++;
        setUploadProgress(Math.round((completedCount / validFiles.length) * 100));

      } catch (error) {
        console.error('Upload error:', error);
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: `Failed to upload ${file.name}`,
        });
      }
    }

    if (uploadedImages.length > 0) {
      setImages(prev => [...prev, ...uploadedImages]);
      toast({
        title: 'Upload complete',
        description: `${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} uploaded`,
      });
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [userId, images.length, maxImages, maxFileSizeMB, toast]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    setImages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  return {
    images,
    isUploading,
    uploadProgress,
    uploadImages,
    removeImage,
    reorderImages,
    setImages,
  };
}
