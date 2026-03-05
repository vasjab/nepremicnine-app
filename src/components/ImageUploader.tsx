import { useState, useRef, useCallback } from 'react';
import { Upload, X, GripVertical, ImageIcon, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/imageCompression';
import { Progress } from '@/components/ui/progress';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  compressedSize?: number;
  description?: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onDescriptionChange?: (id: string, description: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  isUploading,
  uploadProgress,
  onUpload,
  onRemove,
  onReorder,
  onDescriptionChange,
  maxImages = 20,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files);
    }
  }, [disabled, isUploading, onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUpload]);

  const handleClickUpload = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  // Drag and drop for reordering
  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Set a transparent drag image so the browser default doesn't interfere
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleImageDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, onReorder]);

  const handleImageDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Calculate visual shift for items between dragged and target positions
  const getItemTransform = useCallback((index: number): string => {
    if (draggedIndex === null || dragOverIndex === null) return '';
    if (index === draggedIndex) return '';

    // Items between source and target need to shift
    if (draggedIndex < dragOverIndex) {
      // Dragging forward: items between shift left
      if (index > draggedIndex && index <= dragOverIndex) {
        return 'translateX(-8px)';
      }
    } else {
      // Dragging backward: items between shift right
      if (index < draggedIndex && index >= dragOverIndex) {
        return 'translateX(8px)';
      }
    }
    return '';
  }, [draggedIndex, dragOverIndex]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200",
          "flex flex-col items-center justify-center gap-4 cursor-pointer",
          "min-h-[200px]",
          isDragOver && !disabled && !isUploading
            ? "border-accent bg-accent/5 scale-[1.02]"
            : "border-border hover:border-accent/50 hover:bg-secondary/50",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || isUploading || images.length >= maxImages}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <Loader2 className="h-12 w-12 text-accent animate-spin" />
            <div className="w-full space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={cn(
              "w-16 h-16 rounded-full bg-secondary flex items-center justify-center",
              "transition-transform duration-200",
              isDragOver && "scale-110"
            )}>
              <Upload className={cn(
                "h-8 w-8 text-muted-foreground transition-colors",
                isDragOver && "text-accent"
              )} />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">
                {isDragOver ? 'Drop images here' : 'Drag & drop images'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse • Max 10MB each • JPG, PNG, WebP
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {images.length} / {maxImages} images
            </p>
          </>
        )}
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDrop={(e) => handleImageDrop(e, index)}
              onDragEnd={handleImageDragEnd}
              style={{
                transform: getItemTransform(index),
                transition: draggedIndex !== null
                  ? 'transform 200ms ease, opacity 200ms ease, box-shadow 200ms ease'
                  : 'transform 300ms ease, opacity 300ms ease, box-shadow 300ms ease',
              }}
              className={cn(
                "relative group aspect-square rounded-xl overflow-hidden bg-muted",
                "cursor-grab active:cursor-grabbing",
                draggedIndex === index && "opacity-40 scale-[0.92] ring-2 ring-accent/50 z-10",
                dragOverIndex === index && draggedIndex !== index && [
                  "ring-2 ring-accent ring-offset-2 ring-offset-background",
                  "shadow-lg shadow-accent/20",
                ],
                draggedIndex === null && index === 0 && "ring-2 ring-accent"
              )}
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Overlay with actions */}
              <div className={cn(
                "absolute inset-0 bg-black/50 flex items-center justify-center gap-2",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                editingDescriptionId === image.id && "opacity-0 pointer-events-none"
              )}>
                {/* Drag handle */}
                <div className="p-2 rounded-lg bg-card/90 backdrop-blur-sm">
                  <GripVertical className="h-5 w-5 text-foreground" />
                </div>

                {/* Description button */}
                {onDescriptionChange && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDescriptionId(image.id);
                      setTimeout(() => descriptionInputRef.current?.focus(), 50);
                    }}
                    className={cn(
                      "p-2 rounded-lg backdrop-blur-sm transition-colors",
                      image.description
                        ? "bg-accent/90 hover:bg-accent"
                        : "bg-card/90 hover:bg-card"
                    )}
                  >
                    <MessageSquare className={cn(
                      "h-5 w-5",
                      image.description ? "text-accent-foreground" : "text-foreground"
                    )} />
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(image.id);
                  }}
                  className={cn(
                    "p-2 rounded-lg bg-destructive/90 backdrop-blur-sm",
                    "hover:bg-destructive transition-colors"
                  )}
                >
                  <X className="h-5 w-5 text-destructive-foreground" />
                </button>
              </div>

              {/* Description editor */}
              {editingDescriptionId === image.id && onDescriptionChange && (
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-3 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={descriptionInputRef}
                    type="text"
                    placeholder="Add a caption..."
                    defaultValue={image.description || ''}
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-lg bg-card/95 text-foreground text-sm placeholder:text-muted-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onDescriptionChange(image.id, (e.target as HTMLInputElement).value);
                        setEditingDescriptionId(null);
                      }
                      if (e.key === 'Escape') {
                        setEditingDescriptionId(null);
                      }
                    }}
                    onBlur={(e) => {
                      onDescriptionChange(image.id, e.target.value);
                      setEditingDescriptionId(null);
                    }}
                  />
                  <p className="text-[10px] text-white/60 mt-1.5">Enter to save, Esc to cancel</p>
                </div>
              )}

              {/* Position badge */}
              <div className={cn(
                "absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium",
                "transition-colors duration-200",
                index === 0
                  ? "bg-accent text-accent-foreground"
                  : "bg-card/90 backdrop-blur-sm text-foreground"
              )}>
                {index === 0 ? 'Cover' : `#${index + 1}`}
              </div>

              {/* Caption or file size info */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="px-2 py-1 rounded-md bg-card/90 backdrop-blur-sm text-xs text-foreground truncate">
                  {image.description || (image.compressedSize
                    ? `${formatBytes(image.compressedSize)} (saved ${Math.round((1 - image.compressedSize / image.size) * 100)}%)`
                    : formatBytes(image.size))
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state hint */}
      {images.length === 0 && !isUploading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
          <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Add photos to make your listing stand out. The first image will be the cover photo.
          </p>
        </div>
      )}
    </div>
  );
}
