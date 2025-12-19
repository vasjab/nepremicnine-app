import { useRef, useState } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AttachmentPreview {
  file: File;
  preview: string;
  type: 'image' | 'document' | 'other';
}

interface AttachmentUploaderProps {
  attachments: AttachmentPreview[];
  onAttachmentsChange: (attachments: AttachmentPreview[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
};

function getFileType(mimeType: string): 'image' | 'document' | 'other' {
  if (ALLOWED_TYPES.image.includes(mimeType)) return 'image';
  if (ALLOWED_TYPES.document.includes(mimeType)) return 'document';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentUploader({
  attachments,
  onAttachmentsChange,
  disabled,
  maxFiles = 5,
  maxSizeMB = 10,
}: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (attachments.length + files.length > maxFiles) {
      toast({
        variant: 'destructive',
        title: 'Too many files',
        description: `You can attach up to ${maxFiles} files`,
      });
      return;
    }

    const validFiles: AttachmentPreview[] = [];

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: `${file.name} exceeds ${maxSizeMB}MB limit`,
        });
        continue;
      }

      const fileType = getFileType(file.type);
      const preview = fileType === 'image' ? URL.createObjectURL(file) : '';
      
      validFiles.push({ file, preview, type: fileType });
    }

    onAttachmentsChange([...attachments, ...validFiles]);
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview);
    }
    newAttachments.splice(index, 1);
    onAttachmentsChange(newAttachments);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={[...ALLOWED_TYPES.image, ...ALLOWED_TYPES.document].join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || attachments.length >= maxFiles}
        className="h-[44px] w-[44px]"
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      {/* Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-secondary/50 rounded-lg">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="relative group bg-background rounded-lg border border-border overflow-hidden"
            >
              {attachment.type === 'image' ? (
                <img
                  src={attachment.preview}
                  alt={attachment.file.name}
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center p-1">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center mt-1">
                    {attachment.file.name.slice(0, 8)}...
                  </span>
                </div>
              )}
              
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-[9px] text-muted-foreground text-center py-0.5">
                {formatFileSize(attachment.file.size)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { AttachmentPreview };
