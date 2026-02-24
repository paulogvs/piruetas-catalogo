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
    '#E91E8C', // Rosa Pirüetas
    '#FFD700', // Dorado
    '#FF4500', // Naranja
    '#00BFFF', // Azul
    '#32CD32', // Verde
    '#9370DB', // Púrpura
];

export function TextConfigModal({ isOpen, onClose, onAddText, editingSticker, canvasSize }: TextConfigModalProps) {
    const [text, setText] = useState('');
    const [fontFamily, setFontFamily] = useState('Comic Neue');
    const [fontSize, setFontSize] = useState(80);
    const [fill, setFill] = useState('#1a1a1a');
    const [backgroundStyle, setBackgroundStyle] = useState<'none' | 'per-word'>('none');
    const [backgroundColor, setBackgroundColor] = useState('#E91E8C');
    const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');

    useEffect(() => {
        if (editingSticker) {
            setText(editingSticker.text || '');
            setFontFamily(editingSticker.fontFamily || 'Comic Neue');
            setFontSize(editingSticker.fontSize || 80);
            setFill(editingSticker.fill || '#1a1a1a');
            setBackgroundStyle(editingSticker.backgroundStyle || 'none');
            setBackgroundColor(editingSticker.backgroundColor || '#E91E8C');
            setAlign(editingSticker.align || 'center');
        } else {
            setText('');
            setFontFamily('Comic Neue');
            setFontSize(80);
            setFill('#1a1a1a');
            setBackgroundStyle('none');
            setBackgroundColor('#E91E8C');
            setAlign('center');
        }
    }, [editingSticker, isOpen]);

    const handleSubmit = () => {
        if (!text.trim()) return;
        const data: StickerData = {
            id: editingSticker?.id || uuidv4(),
            type: 'text',
            x: editingSticker?.x !== undefined ? editingSticker.x : canvasSize.width / 2 - 200,
            y: editingSticker?.y !== undefined ? editingSticker.y : canvasSize.height / 2 - 50,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            text,
            fontFamily,
            fontSize,
            fill,
            backgroundStyle,
            backgroundColor: backgroundStyle !== 'none' ? backgroundColor : undefined,
            align,
            width: 400,
        };
        onAddText(data);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingSticker ? 'Editar Texto' : 'Añadir Texto'}>
            <div className="flex flex-col gap-5">
                {/* Live Preview */}
                <div className="w-full bg-gray-900 rounded-2xl p-8 min-h-[160px] flex items-center justify-center overflow-hidden relative group">
                    <div className="absolute top-2 left-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Vista Previa</div>
                    <div style={{ textAlign: align }}>
                        {text.split(/\s+/).map((word, i) => (
                            <span key={i} style={{
                                display: 'inline-block',
                                fontFamily,
                                fontSize: Math.min(fontSize, 60),
                                color: fill,
                                backgroundColor: backgroundStyle === 'per-word' ? backgroundColor : 'transparent',
                                padding: backgroundStyle === 'per-word' ? '0.1em 0.3em' : '0',
                                borderRadius: backgroundStyle === 'per-word' ? '0.2em' : '0',
                                margin: '0.05em',
                                lineHeight: 1.2,
                            }}>
                                {word}{' '}
                            </span>
                        ))}
                    </div>
                </div>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe tu texto aquí…"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none h-24 font-medium"
                    autoFocus
                />

                {/* Font & Size */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Fuente</label>
                        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none bg-white">
                            {FONTS.map((f) => <option key={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tamaño</label>
                        <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min={20} max={400}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none" />
                    </div>
                </div>

                {/* Colors (Fixed Palette) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Color del Texto</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setFill(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${fill === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Multi-word Style */}
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Estilo de Resaltado</label>
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setBackgroundStyle('none')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-colors ${backgroundStyle === 'none' ? 'bg-gray-100 border-gray-300 shadow-inner' : 'border-gray-100 text-gray-400'}`}
                        >
                            NINGUNO
                        </button>
                        <button
                            onClick={() => setBackgroundStyle('per-word')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-colors ${backgroundStyle === 'per-word' ? 'bg-pink-50 border-pink-500 text-pink-600' : 'border-gray-100 text-gray-400'}`}
                        >
                            BURBUJA POR PALABRA
                        </button>
                    </div>

                    {backgroundStyle !== 'none' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Color del Fondo</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setBackgroundColor(c)}
                                        className={`w-6 h-6 rounded-md border transition-transform ${backgroundColor === c ? 'border-black scale-110 shadow-md' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Alignment */}
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Alineación</label>
                    <div className="flex gap-2">
                        {(['left', 'center', 'right'] as const).map((a) => (
                            <button key={a} onClick={() => setAlign(a)}
                                className={`flex-1 py-2 text-sm rounded-xl border-2 transition-colors ${align === a ? 'border-[var(--color-primary)] bg-pink-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-500'}`}>
                                {a === 'left' ? '⬅ Izq' : a === 'center' ? '⬛ Centro' : 'Der ➡'}
                            </button>
                        ))}
                    </div>
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!text.trim()}>
                    {editingSticker ? '✅ Actualizar Texto' : '➕ Añadir al Canvas'}
                </Button>
            </div>
        </Modal>
    );
}
