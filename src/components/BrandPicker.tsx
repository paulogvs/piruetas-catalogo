import React, { useState, useRef } from 'react';
import { Upload, X, Sparkles, Settings } from 'lucide-react';
import { StickerData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { removeBackgroundLocal } from '../utils/imageUtils';
import { Modal } from './Modal';
import { Button } from './Button';

const API_KEY_STORAGE = 'piruetas_bg_api_key';

interface BrandPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBrand: (sticker: StickerData) => void;
    canvasSize: { width: number; height: number };
}

async function removeBackgroundPoof(file: File, apiKey: string): Promise<string> {
    const formData = new FormData();
    formData.append('image_file', file);
    
    const response = await fetch('https://api.poof.bg/v1/remove', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
        },
        body: formData,
    });
    
    if (!response.ok) {
        throw new Error(`Poof API error: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

const STORAGE_KEY = 'piruetas_custom_brands';

export function BrandPicker({ isOpen, onClose, onAddBrand, canvasSize }: BrandPickerProps) {
    const [customBrands, setCustomBrands] = useState<{ id: string; name: string; src: string }[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessingBg, setIsProcessingBg] = useState(false);
    const [processingLabel, setProcessingLabel] = useState('Sin Fondo');
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
    const [bgMethod, setBgMethod] = useState<'local' | 'api'>('local');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSaveApiKey = () => {
        localStorage.setItem(API_KEY_STORAGE, apiKey);
        setShowApiSettings(false);
    };

    const handleAddCustomImage = (src: string) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            let scale = 1;
            const maxDim = Math.min(canvasSize.width, canvasSize.height) * 0.5;
            if (img.width > maxDim || img.height > maxDim) {
                scale = maxDim / Math.max(img.width, img.height);
            }
            
            const newSticker: StickerData = {
                id: uuidv4(),
                type: 'image',
                x: canvasSize.width / 2 - (img.width * scale) / 2,
                y: canvasSize.height / 2 - (img.height * scale) / 2,
                rotation: 0,
                scaleX: scale,
                scaleY: scale,
                src: src,
            };
            onAddBrand(newSticker);
            onClose();
        };
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const src = event.target?.result as string;
                
                const newBrand = {
                    id: uuidv4(),
                    name: file.name.replace(/\.[^/.]+$/, '').substring(0, 15),
                    src: src
                };
                
                const updated = [...customBrands, newBrand];
                setCustomBrands(updated);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsUploading(false);
        }
    };

    const handleUploadWithBgRemoval = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setIsProcessingBg(true);

        try {
            let src: string;
            
            // Check if API key is configured and use it
            const savedApiKey = localStorage.getItem(API_KEY_STORAGE);
            if (savedApiKey && bgMethod === 'api') {
                // Use Poof API (faster, more reliable)
                setProcessingLabel('Procesando...');
                src = await removeBackgroundPoof(file, savedApiKey);
            } else {
                // Use local Transformers.js (free and improved)
                src = await removeBackgroundLocal(file, (key, current, total) => {
                    if (key === 'loading_model') {
                        setProcessingLabel(`Cargando ${Math.round(current)}%`);
                    } else {
                        setProcessingLabel('Procesando...');
                    }
                });
            }
            
            const newBrand = {
                id: uuidv4(),
                name: file.name.replace(/\.[^/.]+$/, '').substring(0, 15) + ' (sin fondo)',
                src: src
            };
            
            const updated = [...customBrands, newBrand];
            setCustomBrands(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error removing background:', error);
            alert('Error al procesar la imagen. Por favor intenta de nuevo.');
        } finally {
            setIsUploading(false);
            setIsProcessingBg(false);
        }
    };

    const handleDeleteCustomBrand = (id: string) => {
        const updated = customBrands.filter(b => b.id !== id);
        setCustomBrands(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Logos de Marca">
            <div className="space-y-4">
                {/* Upload Section */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Subir logo de marca</h4>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="secondary"
                            className="flex-1"
                            isLoading={isUploading && !isProcessingBg}
                        >
                            <Upload className="w-4 h-4 mr-1.5" />
                            Logo
                        </Button>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1"
                            isLoading={isProcessingBg}
                        >
                            {!isProcessingBg && <Sparkles className="w-4 h-4 mr-1.5" />}
                            {isProcessingBg ? processingLabel : 'Sin Fondo'}
                        </Button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadWithBgRemoval}
                        className="hidden"
                    />
                </div>

                {/* Saved Logos */}
                {customBrands.length > 0 && (
                    <div>
                        <h4 className="font-bold text-gray-400 mb-3 text-[10px] uppercase tracking-widest">Tus logos guardados</h4>
                        <div className="grid grid-cols-4 gap-3">
                            {customBrands.map((brand) => (
                                <div key={brand.id} className="relative group animate-fade-in-up">
                                    <button
                                        onClick={() => handleAddCustomImage(brand.src)}
                                        className="w-full aspect-square rounded-xl border-2 border-gray-100 hover:border-[var(--color-primary)] transition-all overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm"
                                    >
                                        <img
                                            src={brand.src}
                                            alt={brand.name}
                                            className={`w-full h-full p-1 ${brand.src.startsWith('data:image/png') ? 'object-contain' : 'object-cover'}`}
                                        />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCustomBrand(brand.id)}
                                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* API Settings */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => setShowApiSettings(!showApiSettings)}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 w-full transition-colors"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        CONFIGURACIÓN DE API
                        <span className={`ml-auto transform transition-transform ${showApiSettings ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {showApiSettings && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="bgMethod"
                                        checked={bgMethod === 'local'}
                                        onChange={() => setBgMethod('local')}
                                        className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300"
                                    />
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Local (@imgly) · Gratis y offline</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="bgMethod"
                                        checked={bgMethod === 'api'}
                                        onChange={() => setBgMethod('api')}
                                        className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300"
                                    />
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">API (Poof) · Más rápido y preciso</span>
                                </label>
                            </div>

                            {bgMethod === 'api' && (
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Tu clave API de poof.bg"
                                        className="flex-1 px-4 py-2 text-xs border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[var(--color-primary)] outline-none transition-all"
                                    />
                                    <Button size="sm" onClick={handleSaveApiKey}>Guardar</Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
