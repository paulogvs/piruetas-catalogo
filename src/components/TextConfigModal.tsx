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

const FONTS = ['Outfit', 'Inter', 'Playfair Display', 'Georgia', 'Arial', 'Courier New'];
const PRESETS = [
    { label: '🪩 Elegante', fill: '#1a1a1a', stroke: undefined, fontFamily: 'Playfair Display', fontStyle: 'italic' },
    { label: '💪 Bold', fill: '#E91E8C', stroke: '#fff', strokeWidth: 6, fontFamily: 'Outfit' },
    { label: '☀️ Brillante', fill: '#FFD700', stroke: '#333', strokeWidth: 4, fontFamily: 'Outfit' },
    { label: '🕶️ Oscuro', fill: '#ffffff', stroke: '#000000', strokeWidth: 5, fontFamily: 'Inter' },
];

export function TextConfigModal({ isOpen, onClose, onAddText, editingSticker, canvasSize }: TextConfigModalProps) {
    const [text, setText] = useState('');
    const [fontFamily, setFontFamily] = useState('Outfit');
    const [fontSize, setFontSize] = useState(80);
    const [fill, setFill] = useState('#1a1a1a');
    const [stroke, setStroke] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(0);
    const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');

    useEffect(() => {
        if (editingSticker) {
            setText(editingSticker.text || '');
            setFontFamily(editingSticker.fontFamily || 'Outfit');
            setFontSize(editingSticker.fontSize || 80);
            setFill(editingSticker.fill || '#1a1a1a');
            setStroke(editingSticker.stroke || '#ffffff');
            setStrokeWidth(editingSticker.strokeWidth || 0);
            setAlign(editingSticker.align || 'center');
        } else {
            setText('');
            setFontFamily('Outfit');
            setFontSize(80);
            setFill('#1a1a1a');
            setStroke('#ffffff');
            setStrokeWidth(0);
            setAlign('center');
        }
    }, [editingSticker, isOpen]);

    const handleApplyPreset = (p: any) => {
        if (p.fill) setFill(p.fill);
        if (p.stroke) setStroke(p.stroke);
        if (p.strokeWidth !== undefined) setStrokeWidth(p.strokeWidth);
        if (p.fontFamily) setFontFamily(p.fontFamily);
    };

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
            stroke: strokeWidth > 0 ? stroke : undefined,
            strokeWidth: strokeWidth > 0 ? strokeWidth : undefined,
            align,
            width: 400,
        };
        onAddText(data);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingSticker ? 'Editar Texto' : 'Añadir Texto'}>
            <div className="flex flex-col gap-5">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe tu texto aquí…"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none h-24 font-medium"
                    autoFocus
                />

                {/* Presets */}
                <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Estilo rápido</label>
                    <div className="grid grid-cols-4 gap-2">
                        {PRESETS.map((p) => (
                            <button key={p.label} onClick={() => handleApplyPreset(p)}
                                className="py-2 text-xs font-medium rounded-xl border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors">
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

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

                {/* Colors */}
                <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Color texto</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={fill} onChange={(e) => setFill(e.target.value)}
                                className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer" />
                            <span className="text-xs text-gray-400 font-mono">{fill}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Contorno</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={stroke} onChange={(e) => setStroke(e.target.value)}
                                className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Grosor</label>
                        <input type="range" min={0} max={20} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            className="w-full accent-[var(--color-primary)]" />
                    </div>
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
