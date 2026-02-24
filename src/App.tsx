import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasEditor } from './components/CanvasEditor';
import { ImageUploadModal } from './components/ImageUploadModal';
import { TextConfigModal } from './components/TextConfigModal';
import { DownloadOptions } from './components/DownloadOptions';
import { FormatSelector } from './components/FormatSelector';
import { StickerData, FORMATS } from './types';
import {
    ImagePlus, Type, Download, Trash2, Undo2, RotateCcw,
    BringToFront, SendToBack, LayoutTemplate, Smile,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { EmojiPicker } from './components/EmojiPicker';

const STORAGE_KEY = 'piruetas_stickers';
const STORAGE_FORMAT = 'piruetas_format';

export default function App() {
    const [stickers, setStickers] = useState<StickerData[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [history, setHistory] = useState<StickerData[][]>([stickers]);
    const [historyStep, setHistoryStep] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeFormat, setActiveFormat] = useState<string>(() => localStorage.getItem(STORAGE_FORMAT) || 'square');

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isTextModalOpen, setIsTextModalOpen] = useState(false);
    const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
    const [editingSticker, setEditingSticker] = useState<StickerData | null>(null);

    const stageRef = useRef<any>(null);
    const canvasSize = FORMATS[activeFormat];

    // Auto-save
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stickers)); } catch { }
    }, [stickers]);

    useEffect(() => {
        localStorage.setItem(STORAGE_FORMAT, activeFormat);
    }, [activeFormat]);

    // History tracking
    useEffect(() => {
        if (stickers !== history[historyStep]) {
            const newHistory = history.slice(0, historyStep + 1);
            newHistory.push(stickers);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
        }
    }, [stickers]);

    const handleUndo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            setStickers(history[historyStep - 1]);
        }
    };

    const handleReset = () => {
        if (!window.confirm('¿Seguro que quieres empezar de nuevo? Se borrarán todos los elementos.')) return;
        setStickers([]);
        setHistory([[]]);
        setHistoryStep(0);
        setSelectedId(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleBringToFront = () => {
        if (!selectedId) return;
        setStickers(prev => {
            const s = prev.find(x => x.id === selectedId);
            if (!s) return prev;
            return [...prev.filter(x => x.id !== selectedId), s];
        });
    };

    const handleSendToBack = () => {
        if (!selectedId) return;
        setStickers(prev => {
            const s = prev.find(x => x.id === selectedId);
            if (!s) return prev;
            return [s, ...prev.filter(x => x.id !== selectedId)];
        });
    };

    const handleDeleteSelected = () => {
        if (!selectedId) return;
        setStickers(s => s.filter(x => x.id !== selectedId));
        setSelectedId(null);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) handleDeleteSelected();
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') handleUndo();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, historyStep, history]);

    // Edit text event
    useEffect(() => {
        const handleEditText = (e: any) => {
            const sticker = stickers.find(s => s.id === e.detail);
            if (sticker?.type === 'text') { setEditingSticker(sticker); setIsTextModalOpen(true); }
        };
        window.addEventListener('edit-text', handleEditText);
        return () => window.removeEventListener('edit-text', handleEditText);
    }, [stickers]);

    // Global paste
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (isImageModalOpen || isTextModalOpen || isDownloadModalOpen || isFormatModalOpen) return;
            if (e.clipboardData?.items) {
                for (const item of Array.from(e.clipboardData.items)) {
                    if (item.type.indexOf('image') !== -1) {
                        const file = item.getAsFile();
                        if (file) {
                            const reader = new FileReader();
                            reader.addEventListener('load', () => handleAddImage(reader.result as string));
                            reader.readAsDataURL(file);
                            break;
                        }
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isImageModalOpen, isTextModalOpen, isDownloadModalOpen, isFormatModalOpen]);

    const handleAddImage = useCallback((dataUrl: string) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            let scale = 1;
            const maxDim = Math.min(canvasSize.width, canvasSize.height) * 0.8;
            if (img.width > maxDim || img.height > maxDim) scale = maxDim / Math.max(img.width, img.height);
            const newSticker: StickerData = {
                id: uuidv4(), type: 'image',
                x: canvasSize.width / 2 - (img.width * scale) / 2,
                y: canvasSize.height / 2 - (img.height * scale) / 2,
                rotation: 0, scaleX: scale, scaleY: scale, src: dataUrl,
            };
            setStickers(prev => [...prev, newSticker]);
            setSelectedId(newSticker.id);
        };
    }, [canvasSize]);

    const handleAddText = (textData: StickerData) => {
        if (editingSticker) {
            setStickers(stickers.map(s => s.id === textData.id ? textData : s));
        } else {
            setStickers([...stickers, textData]);
            setSelectedId(textData.id);
        }
        setEditingSticker(null);
    };

    const handleAddEmoji = (emoji: string) => {
        const newSticker: StickerData = {
            id: uuidv4(),
            type: 'text',
            x: canvasSize.width / 2 - 60,
            y: canvasSize.height / 2 - 60,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            text: emoji,
            fontFamily: 'Outfit',
            fontSize: 120, // Huge emoji
            fill: '#000000',
            align: 'center',
            backgroundStyle: 'none',
        };
        setStickers(prev => [...prev, newSticker]);
        setSelectedId(newSticker.id);
    };

    const handleDownload = async (targetWidth: number, targetHeight: number) => {
        if (!stageRef.current) return;
        setSelectedId(null);
        await new Promise(resolve => setTimeout(resolve, 80));
        const stage = stageRef.current;
        const oldW = stage.width(), oldH = stage.height();
        const oldSX = stage.scaleX(), oldSY = stage.scaleY();
        const dx = (targetWidth - canvasSize.width) / 2;
        const dy = (targetHeight - canvasSize.height) / 2;
        stage.width(targetWidth); stage.height(targetHeight);
        stage.scaleX(1); stage.scaleY(1);
        const layers = stage.getChildren();
        layers.forEach((l: any) => { l.x(dx); l.y(dy); });

        const bgLayer = new Konva.Layer();
        bgLayer.add(new Konva.Rect({ x: 0, y: 0, width: targetWidth, height: targetHeight, fill: 'white' }));
        stage.add(bgLayer); bgLayer.moveToBottom();

        const wLayer = new Konva.Layer();
        const wFontSize = Math.min(targetWidth, targetHeight) * 0.06;
        wLayer.add(new Konva.Text({
            text: 'PIRÜETAS CON ESTILO', fontSize: wFontSize, fontFamily: 'Outfit',
            fontStyle: 'bold', fill: 'white', stroke: 'black',
            strokeWidth: Math.max(1, wFontSize * 0.04), opacity: 0.2,
            x: 0, y: targetHeight - wFontSize * 2.5, width: targetWidth, align: 'center',
        }));
        stage.add(wLayer);

        const dataURL = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
        bgLayer.destroy(); wLayer.destroy();
        layers.forEach((l: any) => { l.x(0); l.y(0); });
        stage.width(oldW); stage.height(oldH);
        stage.scaleX(oldSX); stage.scaleY(oldSY);

        const link = document.createElement('a');
        link.download = `piruetas-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toolbarBtns = [
        { icon: <ImagePlus className="w-5 h-5" />, label: 'Imagen', onClick: () => setIsImageModalOpen(true) },
        { icon: <Type className="w-5 h-5" />, label: 'Texto', onClick: () => { setEditingSticker(null); setIsTextModalOpen(true); } },
        { icon: <Smile className="w-5 h-5" />, label: 'Emoji', onClick: () => setIsEmojiModalOpen(true) },
        { icon: <LayoutTemplate className="w-5 h-5" />, label: 'Formato', onClick: () => setIsFormatModalOpen(true) },
    ];

    return (
        <div className="flex flex-col h-screen bg-[var(--color-bg)] overflow-hidden select-none">

            {/* ── HEADER ── */}
            <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-10 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-tr from-[var(--color-primary)] to-pink-300 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-base font-serif italic">P</span>
                    </div>
                    <span className="font-bold text-base tracking-tight text-gray-900 hidden xs:block">PIRÜETAS <span className="text-[var(--color-primary)]">CON ESTILO</span></span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleUndo} disabled={historyStep === 0}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        title="Deshacer (Ctrl+Z)">
                        <Undo2 className="w-4.5 h-4.5" />
                    </button>
                    <button onClick={handleReset}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                        title="Reiniciar">
                        <RotateCcw className="w-4.5 h-4.5" />
                    </button>
                </div>
            </header>

            {/* ── CANVAS AREA ── */}
            <main className="flex-1 relative overflow-hidden p-3 sm:p-6 flex items-center justify-center min-h-0">
                <CanvasEditor
                    stickers={stickers}
                    setStickers={setStickers}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    canvasSize={canvasSize}
                    stageRef={stageRef}
                />

                {/* Contextual floating toolbar - appears when element selected */}
                {selectedId && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-xl border border-gray-100 px-2 py-1.5 z-20">
                        <button onClick={handleBringToFront}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Traer al frente">
                            <BringToFront className="w-4 h-4" /> <span className="hidden sm:inline">Frente</span>
                        </button>
                        <div className="w-px h-5 bg-gray-200" />
                        <button onClick={handleSendToBack}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Enviar atrás">
                            <SendToBack className="w-4 h-4" /> <span className="hidden sm:inline">Atrás</span>
                        </button>
                        <div className="w-px h-5 bg-gray-200" />
                        <button onClick={handleDeleteSelected}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                            title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </main>

            {/* ── BOTTOM TOOLBAR ── */}
            <footer className="bg-white border-t border-gray-100 shadow-[0_-2px_20px_rgba(0,0,0,0.06)] px-4 pb-safe pt-3 flex-shrink-0">
                <div className="flex items-center gap-2 max-w-lg mx-auto pb-1">
                    {toolbarBtns.map((btn) => (
                        <button key={btn.label} onClick={btn.onClick}
                            className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-2xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all text-gray-600 hover:text-[var(--color-primary)] active:scale-95">
                            {btn.icon}
                            <span className="text-xs sm:text-sm font-semibold">{btn.label}</span>
                        </button>
                    ))}
                    <button onClick={() => setIsDownloadModalOpen(true)}
                        className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-pink-400 text-white shadow-md hover:shadow-lg transition-all active:scale-95">
                        <Download className="w-5 h-5" />
                        <span className="text-xs sm:text-sm font-semibold">Guardar</span>
                    </button>
                </div>
            </footer>

            {/* ── MODALS ── */}
            <ImageUploadModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onAddImage={handleAddImage} />
            <TextConfigModal
                isOpen={isTextModalOpen} onClose={() => { setIsTextModalOpen(false); setEditingSticker(null); }}
                onAddText={handleAddText} editingSticker={editingSticker} canvasSize={canvasSize}
            />
            <DownloadOptions isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} onDownload={handleDownload} currentFormat={activeFormat} />
            <FormatSelector isOpen={isFormatModalOpen} onClose={() => setIsFormatModalOpen(false)} currentFormat={activeFormat} onSelectFormat={setActiveFormat} />
            <EmojiPicker isOpen={isEmojiModalOpen} onClose={() => setIsEmojiModalOpen(false)} onSelectEmoji={handleAddEmoji} />
        </div>
    );
}
