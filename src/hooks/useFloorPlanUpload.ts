import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, generateUniqueFilename, isValidImageType, isWithinSizeLimit } from '@/lib/imageCompression';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFloorPlan {
  id: string;
  url: string;
  name: string;
  size: number;
  compressedSize?: number;
}

interface UseFloorPlanUploadOptions {
  userId: string;
  maxFloorPlans?: number;
  maxFileSizeMB?: number;
}

interface UseFloorPlanUploadReturn {
  floorPlans: UploadedFloorPlan[];
  isUploading: boolean;
  uploadProgress: number;
  uploadFloorPlans: (files: FileList | File[]) => Promise<void>;
  removeFloorPlan: (id: string) => void;
  reorderFloorPlans: (startIndex: number, endIndex: number) => void;
  setFloorPlans: (floorPlans: UploadedFloorPlan[]) => void;
}

export function useFloorPlanUpload({
  userId,
  maxFloorPlans = 5,
  maxFileSizeMB = 10,
}: UseFloorPlanUploadOptions): UseFloorPlanUploadReturn {
  const [floorPlans, setFloorPlans] = useState<UploadedFloorPlan[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFloorPlans = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max floor plans limit
    if (floorPlans.length + fileArray.length > maxFloorPlans) {
      toast({
        variant: 'destructive',
        title: 'Too many floor plans',
        description: `Maximum ${maxFloorPlans} floor plans allowed`,
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

    const uploadedFloorPlans: UploadedFloorPlan[] = [];
    let completedCount = 0;

    for (const file of validFiles) {
      try {
        // Compress the image (use higher quality for floor plans)
        const compressed = await compressImage(file, {
          maxWidth: 2560,
          maxHeight: 2560,
          quality: 0.9,
          type: 'image/webp',
        });

        // Generate unique filename with floor-plans prefix
        const filename = generateUniqueFilename(file.name, 'webp');
        const filePath = `${userId}/floor-plans/${filename}`;

        // Upload to Supabase Storage (same bucket as listing images)
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

        uploadedFloorPlans.push({
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

    if (uploadedFloorPlans.length > 0) {
      setFloorPlans(prev => [...prev, ...uploadedFloorPlans]);
      toast({
        title: 'Upload complete',
        description: `${uploadedFloorPlans.length} floor plan${uploadedFloorPlans.length > 1 ? 's' : ''} uploaded`,
      });
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [userId, floorPlans.length, maxFloorPlans, maxFileSizeMB, toast]);

  const removeFloorPlan = useCallback((id: string) => {
    setFloorPlans(prev => prev.filter(fp => fp.id !== id));
  }, []);

  const reorderFloorPlans = useCallback((startIndex: number, endIndex: number) => {
    setFloorPlans(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  return {
    floorPlans,
    isUploading,
    uploadProgress,
    uploadFloorPlans,
    removeFloorPlan,
    reorderFloorPlans,
    setFloorPlans,
  };
}
