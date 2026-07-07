import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxWidth = 'max-w-md',
}) => {
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Basic focus management: move focus into the dialog on open (so
  // keyboard/screen-reader users land somewhere useful instead of staying
  // on a now-hidden trigger), and restore it to whatever was focused before
  // the dialog opened once it closes.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      closeButtonRef.current?.focus();
    } else if (previouslyFocusedRef.current instanceof HTMLElement) {
      previouslyFocusedRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Panel */}
      <div 
        className={cn(
          'glass-panel relative w-full overflow-hidden p-6 animate-slide-up shadow-2xl z-10 flex flex-col',
          maxWidth,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-xl font-semibold text-white">{title}</h2>
          <Button 
            ref={closeButtonRef}
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full text-gray-400 hover:text-white"
            aria-label="Close dialog"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
