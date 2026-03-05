import React from 'react';
import { Modal } from './Modal';
import { StickerData } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StampPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onAddStamp: (data: StickerData) => void;
    canvasSize: { width: number; height: number };
}

interface StampTemplate {
    text: string;
    fill: string;
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    label: string;
}

const STAMPS: StampTemplate[] = [
    { label: 'MODA 🔥', text: 'OFERTA', fill: '#ffffff', backgroundColor: '#111827', fontFamily: 'Bebas Neue', fontSize: 100 },
    { label: 'LIMITADO ⏳', text: 'ÚLTIMAS\nUNIDADES', fill: '#111827', backgroundColor: '#D4AF37', fontFamily: 'Bebas Neue', fontSize: 80 },
    { label: 'EDITORIAL ✨', text: 'NUEVA\nCOLECCIÓN', fill: '#ffffff', backgroundColor: '#111827', fontFamily: 'Montserrat', fontSize: 70 },
    { label: 'PREMIUM 💎', text: 'PREMIUM', fill: '#D4AF37', backgroundColor: '#111827', fontFamily: 'Cormorant Garamond', fontSize: 90 },
    { label: 'BÁSICO 👕', text: 'BÁSICO', fill: '#ffffff', backgroundColor: '#4B5563', fontFamily: 'Montserrat', fontSize: 80 },
    { label: 'SALE 🏷️', text: 'SALE', fill: '#ffffff', backgroundColor: '#B91C1C', fontFamily: 'Bebas Neue', fontSize: 120 },
    { label: 'NUEVO ⚡', text: 'FLASH SALE', fill: '#ffffff', backgroundColor: '#065F46', fontFamily: 'Bebas Neue', fontSize: 90 },
    { label: 'LUJO ❤️', text: 'MUST HAVE', fill: '#ffffff', backgroundColor: '#111827', fontFamily: 'Cormorant Garamond', fontSize: 80 },
];

export function StampPicker({ isOpen, onClose, onAddStamp, canvasSize }: StampPickerProps) {
    const handleSelect = (stamp: StampTemplate) => {
        const data: StickerData = {
            id: uuidv4(),
            type: 'text',
            x: canvasSize.width / 2,
            y: canvasSize.height / 2,
            rotation: (Math.random() - 0.5) * 10, // Slight random rotation for "stamp" feel
            scaleX: 1,
            scaleY: 1,
            text: stamp.text,
            fontFamily: stamp.fontFamily,
            fontSize: stamp.fontSize,
            fill: stamp.fill,
            backgroundStyle: 'per-word',
            backgroundColor: stamp.backgroundColor,
            align: 'center',
            width: 400,
        };
        onAddStamp(data);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sellos de Venta 🏷️">
            <div className="grid grid-cols-2 gap-4 p-2 max-h-[70vh] overflow-y-auto">
                {STAMPS.map((stamp, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(stamp)}
                        className="group relative flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-pink-500 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 group-hover:text-pink-500 transition-colors">
                            {stamp.label}
                        </div>
                        <div className="w-full flex items-center justify-center overflow-hidden min-h-[80px]">
                            <div style={{
                                textAlign: 'center',
                                transform: 'rotate(-2deg)',
                                transition: 'transform 0.3s ease'
                            }} className="group-hover:rotate-0">
                                {stamp.text.split('\n').map((line, li) => (
                                    <div key={li} className="flex flex-wrap justify-center">
                                        {line.split(' ').map((word, wi) => (
                                            <span key={wi} style={{
                                                display: 'inline-block',
                                                fontFamily: stamp.fontFamily,
                                                fontSize: Math.min(stamp.fontSize * 0.3, 22),
                                                color: stamp.fill,
                                                backgroundColor: stamp.backgroundColor,
                                                padding: '0.2em 0.5em',
                                                borderRadius: '0.3em',
                                                margin: '0.05em',
                                                lineHeight: 1,
                                                boxShadow: `0 4px 12px ${stamp.backgroundColor}40`,
                                                textTransform: 'uppercase'
                                            }}>
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-pink-500 text-white p-1 rounded-full shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="mt-6 p-4 bg-pink-50 rounded-2xl border border-pink-100 italic text-[11px] text-pink-700 text-center font-medium">
                💡 Los sellos se añaden como stickers editables. ¡Mézclalos para crear diseños únicos!
            </div>
        </Modal>
    );
}
