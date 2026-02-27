import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { StickerData, FORMATS } from '../types';
import { X, Smartphone, Monitor, Maximize2 } from 'lucide-react';

interface PreviewModalProps {
  stickers: StickerData[];
  format: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ stickers, format, isOpen, onClose }: PreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [stageKey, setStageKey] = useState(0);

  const canvasSize = FORMATS[format];

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const isMobile = viewMode === 'mobile';
    const previewWidth = isMobile ? 280 : 400;
    const scale = previewWidth / canvasSize.width;
    const previewHeight = canvasSize.height * scale;

    const stage = new Konva.Stage({
      container: container,
      width: previewWidth,
      height: previewHeight,
      scaleX: scale,
      stage: { scaleX: scale }
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      fill: 'white',
    });
    layer.add(bg);

    stickers.forEach((sticker) => {
      if (sticker.type === 'image') {
        const imgObj = new window.Image();
        imgObj.src = sticker.src;
        imgObj.onload = () => {
          const img = new Konva.Image({
            x: sticker.x,
            y: sticker.y,
            image: imgObj,
            width: imgObj.width * sticker.scaleX,
            height: imgObj.height * sticker.scaleY,
            rotation: sticker.rotation,
            scaleX: sticker.scaleX,
            scaleY: sticker.scaleY,
            draggable: false,
          });
          layer.add(img);
          layer.batchDraw();
        };
      } else if (sticker.type === 'text') {
        const textGroup = new Konva.Group({
          x: sticker.x,
          y: sticker.y,
          rotation: sticker.rotation,
          draggable: false,
        });

        if (sticker.backgroundStyle === 'solid' && sticker.backgroundColor) {
          const padding = 8;
          const textWidth = sticker.text.length * (sticker.fontSize || 24) * 0.6;
          const bgRect = new Konva.Rect({
            x: -padding,
            y: -(sticker.fontSize || 24) - padding,
            width: textWidth + padding * 2,
            height: (sticker.fontSize || 24) + padding * 2,
            fill: sticker.backgroundColor,
            cornerRadius: 8,
          });
          textGroup.add(bgRect);
        }

        const text = new Konva.Text({
          text: sticker.text,
          fontSize: sticker.fontSize || 24,
          fontFamily: sticker.fontFamily || 'Outfit',
          fill: sticker.fill || '#000000',
          align: sticker.align || 'center',
          fontStyle: sticker.fontStyle || 'normal',
        });
        textGroup.add(text);
        layer.add(textGroup);
      }
    });

    layer.draw();

    return () => {
      stage.destroy();
    };
  }, [stickers, canvasSize, isOpen, viewMode, stageKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Vista Previa</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => { setViewMode('mobile'); setStageKey(k => k + 1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === 'mobile' 
                  ? 'bg-pink-100 text-pink-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </button>
            <button
              onClick={() => { setViewMode('desktop'); setStageKey(k => k + 1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === 'desktop' 
                  ? 'bg-pink-100 text-pink-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </button>
          </div>

          <div className="flex justify-center">
            <div 
              ref={containerRef}
              className="rounded-lg overflow-hidden shadow-lg border-4 border-gray-900"
              style={{ 
                backgroundColor: '#fafafa',
                maxWidth: viewMode === 'mobile' ? '280px' : '400px'
              }}
            />
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Vista previa de cómo se verá tu imagen exportada
          </p>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
}
