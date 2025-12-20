import { WizardStepWrapper } from '../WizardStepWrapper';
import { ImageUploader } from '@/components/ImageUploader';
import { cn } from '@/lib/utils';
import { Camera, Star, Lightbulb } from 'lucide-react';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  compressedSize?: number;
}

interface PhotosStepProps {
  images: UploadedImage[];
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  disabled?: boolean;
}

const PHOTO_TIPS = [
  "Use natural lighting when possible",
  "Capture each room from multiple angles",
  "Show outdoor spaces and views",
  "First photo becomes the cover image",
];

export function PhotosStep({
  images,
  isUploading,
  uploadProgress,
  onUpload,
  onRemove,
  onReorder,
  disabled,
}: PhotosStepProps) {
  const hasImages = images.length > 0;

  return (
    <WizardStepWrapper
      title="Show off your space"
      subtitle="Great photos get 3x more views"
      emoji="📸"
    >
      <div className="space-y-6">
        {/* Photo Tips - Show when no images */}
        {!hasImages && (
          <div className="bg-accent/10 rounded-xl p-4 max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-accent font-medium mb-2">
              <Lightbulb className="h-4 w-4" />
              Tips for great photos
            </div>
            <ul className="space-y-1">
              {PHOTO_TIPS.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Area */}
        <div className={cn(
          "transition-all duration-300",
          hasImages ? "" : "max-w-xl mx-auto"
        )}>
          <ImageUploader
            images={images}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onUpload={onUpload}
            onRemove={onRemove}
            onReorder={onReorder}
            maxImages={20}
            disabled={disabled}
          />
        </div>

        {/* Image Counter */}
        {hasImages && (
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Camera className="h-4 w-4" />
              {images.length} photo{images.length !== 1 ? 's' : ''} uploaded
            </div>
            <div className="flex items-center gap-2 text-accent">
              <Star className="h-4 w-4" />
              First photo is the cover
            </div>
          </div>
        )}
      </div>
    </WizardStepWrapper>
  );
}
