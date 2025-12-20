import { FileText, Download, Image as ImageIcon, Eye, FileAudio, FileVideo, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageAttachmentProps {
  fileUrl: string;
  fileName: string;
  fileType: 'image' | 'document' | 'other';
  fileSize?: number;
  mimeType?: string;
  onImageClick?: (url: string, fileName: string) => void;
  className?: string;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType?: string, fileType?: string) {
  if (fileType === 'image') return ImageIcon;
  if (mimeType?.startsWith('video/')) return FileVideo;
  if (mimeType?.startsWith('audio/')) return FileAudio;
  if (mimeType === 'application/pdf' || fileType === 'document') return FileText;
  return File;
}

function isPdf(mimeType?: string, fileName?: string): boolean {
  return mimeType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf') || false;
}

function isVideo(mimeType?: string): boolean {
  return mimeType?.startsWith('video/') || false;
}

function isAudio(mimeType?: string): boolean {
  return mimeType?.startsWith('audio/') || false;
}

export function MessageAttachment({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  mimeType,
  onImageClick,
  className,
}: MessageAttachmentProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(fileUrl, '_blank');
    }
  };

  const handlePreview = () => {
    window.open(fileUrl, '_blank');
  };

  // Image type - clickable for full screen
  if (fileType === 'image') {
    return (
      <div 
        className={cn("cursor-pointer rounded-lg overflow-hidden max-w-xs group relative", className)}
        onClick={() => onImageClick?.(fileUrl, fileName)}
      >
        <img
          src={fileUrl}
          alt={fileName}
          className="w-full h-auto max-h-48 object-cover transition-opacity group-hover:opacity-90"
        />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-background/80 rounded-full p-2">
            <Eye className="h-5 w-5 text-foreground" />
          </div>
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Video type - embedded player
  if (isVideo(mimeType)) {
    return (
      <div className={cn("rounded-lg overflow-hidden max-w-xs", className)}>
        <video
          src={fileUrl}
          controls
          className="w-full max-h-48 object-contain bg-secondary"
        >
          Your browser does not support the video tag.
        </video>
        <div className="flex items-center justify-between p-2 bg-secondary/50">
          <span className="text-xs text-muted-foreground truncate flex-1">{fileName}</span>
          <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Audio type - embedded player
  if (isAudio(mimeType)) {
    return (
      <div className={cn("rounded-lg overflow-hidden max-w-xs bg-secondary/50 p-3", className)}>
        <audio src={fileUrl} controls className="w-full">
          Your browser does not support the audio element.
        </audio>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground truncate flex-1">{fileName}</span>
          <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // PDF and documents - show preview + download
  const FileIcon = getFileIcon(mimeType, fileType);
  const canPreview = isPdf(mimeType, fileName);

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg bg-secondary/50 max-w-xs",
      className
    )}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
        <FileIcon className="h-5 w-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
        {fileSize && (
          <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {canPreview && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreview}
            className="flex-shrink-0 h-8 w-8"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="flex-shrink-0 h-8 w-8"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
