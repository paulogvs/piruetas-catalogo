import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FORMATS } from '../types';
import { Download } from 'lucide-react';

interface DownloadOptionsProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: (w: number, h: number) => void;
    currentFormat: string;
}

export function DownloadOptions({ isOpen, onClose, onDownload, currentFormat }: DownloadOptionsProps) {
    const format = FORMATS[currentFormat];
    if (!format) return null;

    const options = [
        { label: `Original (${format.width}×${format.height})`, w: format.width, h: format.height },
        { label: `Grande (${format.width * 2}×${format.height * 2})`, w: format.width * 2, h: format.height * 2 },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Descargar Imagen">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500">
                    Formato actual: <span className="font-semibold text-gray-800">{format.label}</span>
                </p>
                <div className="flex flex-col gap-3">
                    {options.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => { onDownload(opt.w, opt.h); onClose(); }}
                            className="flex items-center justify-between p-5 rounded-[1.5rem] border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group active:scale-95"
                        >
                            <div className="text-left">
                                <p className="font-bold text-gray-900 group-hover:text-primary">{opt.label}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{(opt.w * opt.h / 1_000_000).toFixed(1)} Megapíxeles</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <Download className="w-5 h-5" />
                            </div>
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400 text-center">La imagen se descarga como PNG con fondo blanco y marca de agua.</p>
            </div>
        </Modal>
    );
}
