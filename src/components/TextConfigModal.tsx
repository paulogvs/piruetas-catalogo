import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { StickerData } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TextConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddText: (data: StickerData) => void;
    editingSticker: StickerData | null;
    canvasSize: { width: number; height: number };
}

const FONTS = ['Comic Neue', 'Outfit', 'Playfair Display', 'Bebas Neue', 'Lobster', 'Montserrat'];
const COLORS = [
    '#ffffff', // Blanco
    '#1a1a1a', // Negro
    '#475569', // Azul Plomo
    '#3B82F6', // Azul
    '#FFD700', // Dorado
    '#FF4500', // Naranja
    '#32CD32', // Verde
    '#9370DB', // Púrpura
];

export function TextConfigModal({ isOpen, onClose, onAddText, editingSticker, canvasSize }: TextConfigModalProps) {
    const [text, setText] = useState('');
    const [fontFamily, setFontFamily] = useState('Comic Neue');
    const [fontSize, setFontSize] = useState(80);
    const [fill, setFill] = useState('#1a1a1a');
    const [backgroundStyle, setBackgroundStyle] = useState<'none' | 'per-word' | 'letter'>('none');
    const [backgroundColor, setBackgroundColor] = useState('#475569');

    useEffect(() => {
        if (editingSticker) {
            setText(editingSticker.text || '');
            setFontFamily(editingSticker.fontFamily || 'Comic Neue');
            setFontSize(editingSticker.fontSize || 80);
            setFill(editingSticker.fill || '#1a1a1a');
            setBackgroundStyle((editingSticker.backgroundStyle as 'none' | 'per-word' | 'letter') || 'none');
            setBackgroundColor(editingSticker.backgroundColor || '#475569');
        } else {
            setText('');
            setFontFamily('Comic Neue');
            setFontSize(80);
            setFill('#1a1a1a');
            setBackgroundStyle('none');
            setBackgroundColor('#475569');
        }
    }, [editingSticker, isOpen]);

    const handleSubmit = () => {
        if (!text.trim()) return;
        const data: StickerData = {
            id: editingSticker?.id || uuidv4(),
            type: 'text',
            x: editingSticker?.x !== undefined ? editingSticker.x : canvasSize.width / 2 - 200,
            y: editingSticker?.y !== undefined ? editingSticker.y : canvasSize.height / 2 - 50,
            rotation: editingSticker?.rotation || 0,
            scaleX: editingSticker?.scaleX || 1,
            scaleY: editingSticker?.scaleY || 1,
            text,
            fontFamily,
            fontSize,
            fill,
            backgroundStyle,
            backgroundColor: backgroundStyle !== 'none' ? backgroundColor : undefined,
            align: 'center',
            width: 400,
        };
        onAddText(data);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingSticker ? 'Editar Texto' : 'Añadir Texto'}>
            <div className="flex flex-col gap-5 max-h-[80vh] overflow-y-auto px-1 pb-4">
                {/* Live Preview - Sticky Header */}
                <div className="sticky top-0 z-20 w-full bg-white border-b-2 border-gray-100 -mx-1 px-4 py-6 mb-2 flex items-center justify-center overflow-hidden shadow-sm">
                    <div className="absolute top-1 left-2 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] italic">Canvas Preview</div>
                    <div className="bg-white shadow-inner border border-gray-50 p-6 rounded-lg w-full flex items-center justify-center min-h-[100px]">
                        <div style={{ textAlign: 'center' }}>
                            {text.split(/\s+/).map((word, i) => (
                                <span key={i} style={{
                                    display: 'inline-block',
                                    fontFamily,
                                    fontSize: Math.min(fontSize * 0.5, 40),
                                    color: fill,
                                    backgroundColor: backgroundStyle === 'per-word' ? backgroundColor : 'transparent',
                                    padding: backgroundStyle === 'per-word' ? '0.2em 0.4em' : '0',
                                    borderRadius: backgroundStyle === 'per-word' ? '0.3em' : '0',
                                    margin: '0.05em',
                                    lineHeight: 1,
                                    boxShadow: backgroundStyle === 'per-word' ? `0 2px 8px ${backgroundColor}40` : 'none',
                                }}>
                                    {word}{' '}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escribe tu texto aquí…"
                        className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl text-lg focus:ring-4 focus:ring-blue-100 focus:border-[var(--color-primary)] outline-none resize-none h-28 font-medium placeholder:text-gray-300 transition-all"
                        autoFocus
                    />

                    {/* Font & Size */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Fuente</label>
                            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-[var(--color-primary)] outline-none bg-white font-semibold transition-all">
                                {FONTS.map((f) => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Tamaño</label>
                            <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min={20} max={400}
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-[var(--color-primary)] outline-none font-semibold transition-all" />
                        </div>
                    </div>

                    {/* Colors (Dropdown) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Color del Texto</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: fill }} />
                                <select value={fill} onChange={(e) => setFill(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-[var(--color-primary)] outline-none bg-white font-semibold transition-all appearance-none"
                                    style={{ color: fill === '#ffffff' ? '#000' : fill }}>
                                    {COLORS.map((c) => (
                                        <option key={c} value={c} style={{ color: c === '#ffffff' ? '#000' : c }}>
                                            {c === '#ffffff' ? 'Blanco' : c === '#1a1a1a' ? 'Negro' : c === '#475569' ? 'Azul Plomo' : c === '#3B82F6' ? 'Azul' : c === '#FFD700' ? 'Dorado' : c === '#FF4500' ? 'Naranja' : c === '#32CD32' ? 'Verde' : 'Púrpura'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Color de Fondo</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: backgroundColor }} />
                                <select value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-[var(--color-primary)] outline-none bg-white font-semibold transition-all appearance-none">
                                    {COLORS.map((c) => (
                                        <option key={c} value={c}>
                                            {c === '#ffffff' ? 'Blanco' : c === '#1a1a1a' ? 'Negro' : c === '#475569' ? 'Azul Plomo' : c === '#3B82F6' ? 'Azul' : c === '#FFD700' ? 'Dorado' : c === '#FF4500' ? 'Naranja' : c === '#32CD32' ? 'Verde' : 'Púrpura'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Background Style */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Estilo</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setBackgroundStyle('none')}
                                className={`py-3 text-xs font-black rounded-xl border-2 transition-all ${backgroundStyle === 'none' ? 'bg-white border-gray-900 shadow-sm translate-y-[-2px]' : 'bg-transparent border-transparent text-gray-400'}`}
                            >
                                LIMPIO
                            </button>
                            <button
                                onClick={() => { setBackgroundStyle('per-word'); if (backgroundColor === '#475569') setBackgroundColor('#3B82F6'); }}
                                className={`py-3 text-xs font-black rounded-xl border-2 transition-all ${backgroundStyle === 'per-word' ? 'bg-white border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm translate-y-[-2px]' : 'bg-transparent border-transparent text-gray-400'}`}
                            >
                                CAJA
                            </button>
                            <button
                                onClick={() => { setBackgroundStyle('letter'); if (backgroundColor === '#475569') setBackgroundColor('#3B82F6'); }}
                                className={`py-3 text-xs font-black rounded-xl border-2 transition-all ${backgroundStyle === 'letter' ? 'bg-white border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm translate-y-[-2px]' : 'bg-transparent border-transparent text-gray-400'}`}
                            >
                                CONTORNO
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSubmit} className="w-full py-4 text-base font-black tracking-wider transition-all hover:scale-[1.02] active:scale-95" size="lg" disabled={!text.trim()}>
                        {editingSticker ? '✅ ACTUALIZAR' : '➕ AÑADIR AL CANVAS'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
