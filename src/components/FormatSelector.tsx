import React from 'react';
import { Modal } from './Modal';
import { FORMATS } from '../types';

interface FormatSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentFormat: string;
    onSelectFormat: (key: string) => void;
}

const ICONS: Record<string, string> = {
    square: '🔲',
    story: '📱',
    post: '🖼️',
    landscape: '🖥️',
};

export function FormatSelector({ isOpen, onClose, currentFormat, onSelectFormat }: FormatSelectorProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Formato">
            <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500 mb-1">Elige el formato de tu publicación. El canvas se ajustará automáticamente.</p>
                {Object.entries(FORMATS).map(([key, fmt]) => (
                    <button
                        key={key}
                        onClick={() => { onSelectFormat(key); onClose(); }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${currentFormat === key
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <span className="text-2xl grayscale">{ICONS[key]}</span>
                        <div>
                            <p className={`font-bold ${currentFormat === key ? 'text-primary' : 'text-gray-800'}`}>
                                {fmt.label}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{fmt.width} × {fmt.height} px</p>
                        </div>
                        {currentFormat === key && (
                            <span className="ml-auto text-primary font-black text-xs uppercase tracking-widest">✓ Seleccionado</span>
                        )}
                    </button>
                ))}
            </div>
        </Modal>
    );
}
