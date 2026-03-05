import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Listing } from '@/types/listing';
import { ListingDetailContent } from '@/components/ListingDetailContent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ListingDetailModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export function ListingDetailModal({ listing, isOpen, onClose }: ListingDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsAnimating(false);
    }, 200);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300",
        isClosing ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isAnimating && !isClosing ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />
      
      {/* Fixed Back Button - outside scrollable area for true fixed positioning */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-[60] h-10 w-10 rounded-[10px] bg-white/90 backdrop-blur-md border border-black/[0.06]",
          "hover:bg-white active:scale-95",
          "shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-150",
          "touch-target"
        )}
        onClick={handleClose}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      {/* Scrollable content container */}
      <div 
        className={cn(
          "fixed inset-0 z-50 overflow-y-auto bg-background transition-all duration-300",
          isAnimating && !isClosing 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-4 scale-[0.98]"
        )}
      >
        <ListingDetailContent
          listing={listing}
          onClose={handleClose}
          isModal={true}
          showSimilar={false}
          showRecentlyViewed={false}
          isAnimating={isAnimating}
          isClosing={isClosing}
        />
      </div>
    </div>
  );
}
