import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative w-full ${maxWidth} bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl z-10 max-h-[94vh] flex flex-col animate-in slide-in-from-bottom duration-300`}>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
                    {/* Drag handle for mobile */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full sm:hidden" />
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors active:scale-90"
                    >
                        <X className="w-5.5 h-5.5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto overflow-x-hidden touch-pan-y scrollbar-hide pb-[env(safe-area-inset-bottom,24px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
