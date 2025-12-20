import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { FileImage, Upload, X, GripVertical, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';

interface UploadedFloorPlan {
  id: string;
  url: string;
  name: string;
  size: number;
  compressedSize?: number;
}

interface FloorPlansStepProps {
  floorPlans: UploadedFloorPlan[];
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  disabled?: boolean;
}

const FLOOR_PLAN_TIPS = [
  "Clear, high-resolution scans work best",
  "Include room dimensions if available",
  "Show floor layout and room flow",
  "Multiple floors? Upload each one",
];

export function FloorPlansStep({
  floorPlans,
  isUploading,
  uploadProgress,
  onUpload,
  onRemove,
  onReorder,
  disabled,
}: FloorPlansStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const hasFloorPlans = floorPlans.length > 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(e.target.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <WizardStepWrapper
      title="Add floor plans"
      subtitle="Help viewers understand the layout"
      emoji="📐"
    >
      <div className="space-y-6">
        {/* Tips - Show when no floor plans */}
        {!hasFloorPlans && (
          <div className="bg-accent/10 rounded-xl p-4 max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-accent font-medium mb-2">
              <Lightbulb className="h-4 w-4" />
              Tips for floor plans
            </div>
            <ul className="space-y-1">
              {FLOOR_PLAN_TIPS.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer",
            isDragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium">Uploading...</p>
                <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <FileImage className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Drop floor plans here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <Button variant="outline" size="sm" disabled={disabled}>
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          )}
        </div>

        {/* Floor Plan Previews */}
        {hasFloorPlans && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {floorPlans.map((fp, index) => (
              <div
                key={fp.id}
                className="relative group rounded-xl overflow-hidden border border-border bg-card"
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    onReorder(draggedIndex, index);
                    setDraggedIndex(index);
                  }
                }}
                onDragEnd={() => setDraggedIndex(null)}
              >
                <img
                  src={fp.url}
                  alt={fp.name}
                  className="w-full aspect-[4/3] object-contain bg-secondary/50"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-grab"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(fp.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* File info */}
                <div className="p-2 text-xs text-muted-foreground truncate">
                  {fp.name} • {formatFileSize(fp.compressedSize || fp.size)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Counter */}
        {hasFloorPlans && (
          <p className="text-center text-sm text-muted-foreground">
            {floorPlans.length} floor plan{floorPlans.length !== 1 ? 's' : ''} uploaded
          </p>
        )}

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can add floor plans later
        </p>
      </div>
    </WizardStepWrapper>
  );
}