'use client';

import { useState, useRef, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, generateUniqueFilename, isValidImageType, isWithinSizeLimit } from '@/lib/imageCompression';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  avatarUrl: string;
  fullName: string;
  email: string;
  userId: string;
  onAvatarChange: (url: string) => void;
}

/** Extract the cropped area from an image as a Blob via Canvas API. */
async function getCroppedBlob(
  imageSrc: string,
  cropPixels: Area,
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const size = 400; // output 400x400
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    size,
    size,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas to blob failed'))),
      'image/webp',
      0.9,
    );
  });
}

export function AvatarUpload({
  avatarUrl,
  fullName,
  email,
  userId,
  onAvatarChange,
}: AvatarUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageType(file)) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please select a JPG, PNG or WebP image.' });
      return;
    }
    if (!isWithinSizeLimit(file, 10)) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Image must be under 10 MB.' });
      return;
    }

    // Clean up old object URL if any
    if (objectUrl) URL.revokeObjectURL(objectUrl);

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setDialogOpen(true);

    // Reset input so re-selecting same file fires onChange
    e.target.value = '';
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!objectUrl || !croppedArea) return;

    setUploading(true);
    try {
      const blob = await getCroppedBlob(objectUrl, croppedArea);

      const filename = generateUniqueFilename('avatar', 'webp');
      const filePath = `avatars/${userId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, blob, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);

      onAvatarChange(publicUrl);
      toast({ title: 'Avatar updated', description: 'Your new profile photo is ready.' });
      handleClose();
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not upload avatar. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileSelect}
      />

      {/* Clickable avatar */}
      <div className="flex justify-center relative z-10">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative rounded-full p-1 ring-2 ring-slate-200 bg-white shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400"
        >
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xl bg-secondary">
              {fullName ? getInitials(fullName) : email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Hover / empty overlay */}
          <div className="absolute inset-1 rounded-full bg-black/40 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Camera className="h-5 w-5 text-white" />
            <span className="text-[10px] font-medium text-white/90">
              {avatarUrl ? 'Change' : 'Add photo'}
            </span>
          </div>
        </button>
      </div>

      {/* Crop dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop your photo</DialogTitle>
          </DialogHeader>

          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
            {objectUrl && (
              <Cropper
                image={objectUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSaveCrop} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
