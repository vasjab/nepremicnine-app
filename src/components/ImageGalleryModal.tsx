import { useRef, useState, useEffect } from 'react';
import { X, ArrowUp, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryModalProps {
  images: string[];
  floorPlanUrl?: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ImageGalleryModal({ images, floorPlanUrl, isOpen, onClose, title }: ImageGalleryModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const floorPlanRef = useRef<HTMLDivElement>(null);
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (containerRef.current) {
        setShowFloatingButtons(containerRef.current.scrollTop > 200);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFloorPlan = () => {
    floorPlanRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  const allImages = [...images];
  
  return (
    <div className="fixed inset-0 z-[60] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h2 className="font-semibold text-foreground truncate">
            {title || 'Gallery'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div 
        ref={containerRef}
        className="h-[calc(100vh-3.5rem)] overflow-y-auto"
      >
        <div className="container mx-auto px-4 py-6 space-y-4 max-w-4xl">
          {/* Photo count */}
          <p className="text-sm text-muted-foreground">
            {allImages.length} photo{allImages.length !== 1 ? 's' : ''}
            {floorPlanUrl && ' • 1 floor plan'}
          </p>

          {/* All images stacked vertically */}
          {allImages.map((image, index) => (
            <div 
              key={index}
              className="relative rounded-xl overflow-hidden bg-muted"
            >
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-full h-auto object-cover"
                loading={index > 2 ? 'lazy' : 'eager'}
              />
            </div>
          ))}

          {/* Floor plan section */}
          {floorPlanUrl && (
            <div ref={floorPlanRef} className="pt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Floor plan
              </h3>
              <div className="relative rounded-xl overflow-hidden bg-muted border border-border">
                <img
                  src={floorPlanUrl}
                  alt="Floor plan"
                  className="w-full h-auto object-contain bg-white"
                />
              </div>
            </div>
          )}

          {/* Bottom padding */}
          <div className="h-24" />
        </div>
      </div>

      {/* Floating navigation buttons */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 transition-all duration-300 ${
          showFloatingButtons 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {floorPlanUrl && (
          <Button
            onClick={scrollToFloorPlan}
            className="bg-card text-foreground border border-border shadow-lg hover:bg-muted rounded-full px-5"
            variant="ghost"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Floor plan
          </Button>
        )}
        <Button
          onClick={scrollToTop}
          className="bg-card text-foreground border border-border shadow-lg hover:bg-muted rounded-full px-5"
          variant="ghost"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          To the top
        </Button>
      </div>
    </div>
  );
}