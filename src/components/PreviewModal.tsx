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
  const [viewMode, setViewMode] = useState<'mobile' | 'mobile-full' | 'desktop'>('mobile');
  const [stageKey, setStageKey] = useState(0);

  const canvasSize = FORMATS[format];

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    let previewWidth: number;
    let previewHeight: number;
    let scale: number;

    if (viewMode === 'mobile') {
      previewWidth = Math.min(280, containerWidth - 32);
      scale = previewWidth / canvasSize.width;
      previewHeight = canvasSize.height * scale;
    } else if (viewMode === 'mobile-full') {
      previewWidth = containerWidth - 32;
      scale = previewWidth / canvasSize.width;
      previewHeight = canvasSize.height * scale;
    } else {
      previewWidth = Math.min(containerWidth - 32, canvasSize.width);
      scale = previewWidth / canvasSize.width;
      previewHeight = canvasSize.height * scale;
    }

    const stage = new Konva.Stage({
      container: container,
      width: previewWidth,
      height: previewHeight,
      scaleX: scale,
      scaleY: scale,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col animate-scaleIn">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Vista Previa</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 p-3 sm:p-4 flex flex-col">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3">
            <button
              onClick={() => { setViewMode('mobile-full'); setStageKey(k => k + 1); }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'mobile-full' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Completo</span>
            </button>
            <button
              onClick={() => { setViewMode('mobile'); setStageKey(k => k + 1); }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'mobile' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
            <button
              onClick={() => { setViewMode('desktop'); setStageKey(k => k + 1); }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'desktop' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0">
            <div 
              ref={containerRef}
              className="rounded-lg overflow-hidden shadow-lg border-2 sm:border-4 border-gray-900"
              style={{ 
                backgroundColor: '#fafafa',
              }}
            />
          </div>

          <p className="text-center text-xs text-gray-400 mt-2 sm:mt-3">
            Vista previa de cómo se verá tu imagen exportada
          </p>
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 bg-slate-800 text-white font-medium sm:font-semibold rounded-xl sm:rounded-2xl hover:bg-slate-700 transition-colors text-sm"
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
