import React, { useState, useRef } from 'react';
import { Upload, X, Sparkles, Settings } from 'lucide-react';
import { StickerData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { removeBackground } from '@imgly/background-removal';

const API_KEY_STORAGE = 'piruetas_bg_api_key';

interface BrandPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBrand: (sticker: StickerData) => void;
    canvasSize: { width: number; height: number };
}

async function removeBackgroundLocal(file: File): Promise<string> {
    const blob = await removeBackground(file, {
        progress: (key, current, total) => {
            console.log(`Processing: ${key} - ${current}/${total}`);
        }
    });
    
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(
        new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:image/png;base64,${base64}`;
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
                src = await removeBackgroundPoof(file, savedApiKey);
            } else {
                // Use local @imgly (free but slower)
                src = await removeBackgroundLocal(file);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-scaleIn">
                <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <h3 className="font-bold text-base text-gray-900">Logos de Marca</h3>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Upload Section */}
                    <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Subir logo de marca</h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {isUploading && !isProcessingBg ? 'Subiendo...' : 'Logo'}
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isProcessingBg}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-blue-600 to-slate-600 text-white font-medium rounded-lg hover:shadow-md transition-all disabled:opacity-50 text-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {isProcessingBg ? 'Procesando...' : 'Sin Fondo'}
                            </button>
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
                            <h4 className="font-medium text-gray-700 mb-2 text-xs uppercase tracking-wide">Tus logos guardados</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {customBrands.map((brand) => (
                                    <div key={brand.id} className="relative group">
                                        <button
                                            onClick={() => handleAddCustomImage(brand.src)}
                                            className="w-full aspect-square rounded-lg border border-gray-200 hover:border-blue-400 transition-all overflow-hidden flex items-center justify-center bg-gray-50"
                                        >
                                            {brand.src.startsWith('data:image/png') ? (
                                                <img src={brand.src} alt={brand.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <img src={brand.src} alt={brand.name} className="w-full h-full object-cover" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCustomBrand(brand.id)}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* API Settings */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <button 
                            onClick={() => setShowApiSettings(!showApiSettings)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 w-full"
                        >
                            <Settings className="w-3 h-3" />
                            Background Removal API
                            <span className={`ml-auto transform transition-transform ${showApiSettings ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        
                        {showApiSettings && (
                            <div className="mt-2 space-y-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="method-local"
                                        name="bgMethod"
                                        checked={bgMethod === 'local'}
                                        onChange={() => setBgMethod('local')}
                                        className="text-blue-600"
                                    />
                                    <label htmlFor="method-local" className="text-xs text-gray-600">
                                        Local (@imgly) - Gratis
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="method-api"
                                        name="bgMethod"
                                        checked={bgMethod === 'api'}
                                        onChange={() => setBgMethod('api')}
                                        className="text-blue-600"
                                    />
                                    <label htmlFor="method-api" className="text-xs text-gray-600">
                                        API (Poof) - Más rápido
                                    </label>
                                </div>
                                
                                {bgMethod === 'api' && (
                                    <div className="mt-2">
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="API key..."
                                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleSaveApiKey}
                                            className="mt-1.5 w-full py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
