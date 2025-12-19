import { FileText, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageAttachmentProps {
  fileUrl: string;
  fileName: string;
  fileType: 'image' | 'document' | 'other';
  fileSize?: number;
  onImageClick?: () => void;
  className?: string;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageAttachment({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  onImageClick,
  className,
}: MessageAttachmentProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (fileType === 'image') {
    return (
      <button
        onClick={onImageClick}
        className={cn(
          "block rounded-lg overflow-hidden max-w-[200px] cursor-pointer",
          "hover:opacity-90 transition-opacity",
          className
        )}
      >
        <img
          src={fileUrl}
          alt={fileName}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-secondary/50 max-w-[200px]",
        className
      )}
    >
      <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        {fileSize && (
          <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownload}
        className="h-8 w-8 flex-shrink-0"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
