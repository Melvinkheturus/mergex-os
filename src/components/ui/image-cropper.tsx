"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCw, ZoomIn, ZoomOut, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  cropShape?: "circle" | "square";
  title?: string;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  cropShape = "circle",
  title = "Adjust Image",
  onCropComplete,
}: ImageCropperModalProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(imageSrc);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const cropSize = 240; // Size of the crop window (240x240px)

  // Reset states when modal is opened or imageSrc changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageSrc(imageSrc);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Calculate base image dimensions to fit cover
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const scale = Math.max(cropSize / naturalWidth, cropSize / naturalHeight);
    setImgDimensions({
      width: naturalWidth * scale,
      height: naturalHeight * scale,
    });
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setOffset({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setOffset({ x: 0, y: 0 }); // reset offset on rotate to avoid weird bounds
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Accepted: JPG, PNG, WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCurrentImageSrc(reader.result as string);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const img = imageRef.current;
    if (!img || !imgDimensions.width) return;

    // Create target canvas
    const canvas = document.createElement("canvas");
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Apply circular clipping path if circle crop shape is requested
    if (cropShape === "circle") {
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // 1. Move origin to center of canvas
    ctx.translate(cropSize / 2, cropSize / 2);
    
    // 2. Rotate canvas
    ctx.rotate((rotation * Math.PI) / 180);
    
    // 3. Translate by current offset
    ctx.translate(offset.x, offset.y);
    
    // 4. Scale by current zoom factor
    ctx.scale(zoom, zoom);

    // 5. Draw image centered
    ctx.drawImage(
      img,
      -imgDimensions.width / 2,
      -imgDimensions.height / 2,
      imgDimensions.width,
      imgDimensions.height
    );

    // Export cropped image as file
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], "cropped-avatar.png", {
          type: "image/png",
        });
        onCropComplete(croppedFile);
        onClose();
      }
    }, "image/png");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border border-border/60 rounded-2xl shadow-xl p-6 overflow-hidden">
        <DialogHeader className="text-left">
          <DialogTitle className="text-sm font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag to pan, slider to zoom, and rotate to align perfectly.
          </DialogDescription>
        </DialogHeader>

        {/* Cropping Viewport Area */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full h-[280px] bg-zinc-950 rounded-xl overflow-hidden border border-border/40 flex items-center justify-center cursor-move select-none"
        >
          {currentImageSrc && (
            <img
              ref={imageRef}
              src={currentImageSrc}
              alt="To Crop"
              onLoad={handleImageLoad}
              className="max-w-none absolute select-none pointer-events-none origin-center"
              style={{
                width: `${imgDimensions.width}px`,
                height: `${imgDimensions.height}px`,
                top: `calc(50% - ${imgDimensions.height / 2}px)`,
                left: `calc(50% - ${imgDimensions.width / 2}px)`,
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
            />
          )}

          {/* Dark Overlay with transparent crop cutout area in the center using box shadow */}
          <div 
            className="absolute pointer-events-none border-2 border-[#8B5CF6] shadow-[0_0_0_9999px_rgba(9,9,11,0.75)]"
            style={{
              width: `${cropSize}px`,
              height: `${cropSize}px`,
              borderRadius: cropShape === "circle" ? "50%" : "12px",
              top: `calc(50% - ${cropSize / 2}px)`,
              left: `calc(50% - ${cropSize / 2}px)`,
            }}
          />
        </div>

        {/* Adjusting Controls */}
        <div className="space-y-4 pt-2">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1.5">
                <ZoomOut className="w-3.5 h-3.5" /> Zoom
              </span>
              <span className="font-mono text-[10px] font-bold">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
            />
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="h-8 text-xs font-semibold border-border/40 hover:bg-muted/50 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
              Rotate 90°
            </Button>

            <div className="flex items-center gap-2">
              <input
                ref={modalFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleModalFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => modalFileInputRef.current?.click()}
                className="h-8 text-xs font-semibold border-border/40 hover:bg-muted/50 flex items-center gap-1.5 cursor-pointer text-[#8B5CF6] hover:text-[#7C3AED]"
              >
                <RefreshCw className="w-3 h-3" />
                Replace Image
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                  setRotation(0);
                  setCurrentImageSrc(imageSrc);
                }}
                className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex items-center gap-2 pt-4 border-t border-border/10 bg-muted/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-9 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Cancel
          </Button>
          
          <Button
            type="button"
            onClick={handleSave}
            className="h-9 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold px-4 rounded-lg cursor-pointer ml-auto flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
