import React, { useState, useRef } from 'react';
import { Upload, X, Image, Sparkles, Settings, Loader2 } from 'lucide-react';
import { StickerData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { removeBackground } from '@imgly/background-removal';

const API_KEY_STORAGE = 'piruetas_bg_api_key';
const API_PROVIDER_STORAGE = 'piruetas_bg_provider';

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

const PRELOADED_BRANDS = [
    { id: 'brand-nike', name: 'Nike', color: '#000000' },
    { id: 'brand-adidas', name: 'Adidas', color: '#000000' },
    { id: 'brand-zara', name: 'Zara', color: '#000000' },
    { id: 'brand-hm', name: 'H&M', color: '#000000' },
    { id: 'brand-gucci', name: 'Gucci', color: '#000000' },
    { id: 'brand-versace', name: 'Versace', color: '#000000' },
    { id: 'brand-prada', name: 'Prada', color: '#000000' },
    { id: 'brand-chanel', name: 'Chanel', color: '#000000' },
    { id: 'brand-dior', name: 'Dior', color: '#000000' },
    { id: 'brand-ysl', name: 'YSL', color: '#000000' },
    { id: 'brand-fendi', name: 'Fendi', color: '#000000' },
    { id: 'brand-valentino', name: 'Valentino', color: '#000000' },
    { id: 'brand-burberry', name: 'Burberry', color: '#000000' },
    { id: 'brand-loewe', name: 'Loewe', color: '#000000' },
    { id: 'brand-balenciaga', name: 'Balenciaga', color: '#000000' },
    { id: 'brand-supreme', name: 'Supreme', color: '#FF0000' },
    { id: 'brand-offwhite', name: 'Off-White', color: '#FF0000' },
    { id: 'brand-puma', name: 'Puma', color: '#000000' },
    { id: 'brand-reebok', name: 'Reebok', color: '#000000' },
    { id: 'brand-converse', name: 'Converse', color: '#FF0000' },
];

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
    const [activeTab, setActiveTab] = useState<'brands' | 'custom'>('brands');
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
    const [bgMethod, setBgMethod] = useState<'local' | 'api'>('local');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSaveApiKey = () => {
        localStorage.setItem(API_KEY_STORAGE, apiKey);
        setShowApiSettings(false);
    };

    const handleAddBrand = (brand: { id: string; name: string; color?: string; src?: string }) => {
        const fontSize = Math.min(canvasSize.width, canvasSize.height) * 0.08;
        const textWidth = brand.name.length * fontSize * 0.5;
        
        const newSticker: StickerData = {
            id: uuidv4(),
            type: 'text',
            x: canvasSize.width / 2 - textWidth / 2,
            y: canvasSize.height / 2 - fontSize / 2,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            text: brand.name.toUpperCase(),
            fontFamily: 'Arial Black',
            fontSize: fontSize,
            fill: brand.color || '#000000',
            stroke: brand.color || '#000000',
            strokeWidth: 2,
            align: 'center',
            backgroundStyle: 'none',
        };
        onAddBrand(newSticker);
        onClose();
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
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">Marcas & Logos</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('brands')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'brands' 
                                ? 'text-pink-600 border-b-2 border-pink-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Sparkles className="w-4 h-4 inline mr-1" />
                        Marcas
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'custom' 
                                ? 'text-pink-600 border-b-2 border-pink-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Image className="w-4 h-4 inline mr-1" />
                        Mis Logos
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'brands' ? (
                        <div className="grid grid-cols-3 gap-3">
                            {PRELOADED_BRANDS.map((brand) => (
                                <button
                                    key={brand.id}
                                    onClick={() => handleAddBrand(brand)}
                                    className="aspect-square rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:bg-pink-50 transition-all flex flex-col items-center justify-center gap-1 p-2"
                                >
                                    <span className="text-xs font-bold text-gray-700">{brand.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                                <h4 className="font-semibold text-gray-900 mb-3">Subir tu marca</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {isUploading && !isProcessingBg ? 'Subiendo...' : 'Subir Logo'}
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || isProcessingBg}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {isProcessingBg ? 'Procesando...' : 'Sin Fondo'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    "Sin Fondo" usa IA para quitar el fondo automáticamente
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadWithBgRemoval}
                                    className="hidden"
                                />
                            </div>

                            {/* API Settings */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <button 
                                    onClick={() => setShowApiSettings(!showApiSettings)}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-pink-600"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configuración de Background Removal
                                    <span className={`transform transition-transform ${showApiSettings ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                
                                {showApiSettings && (
                                    <div className="mt-3 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="method-local"
                                                name="bgMethod"
                                                checked={bgMethod === 'local'}
                                                onChange={() => setBgMethod('local')}
                                                className="text-pink-600"
                                            />
                                            <label htmlFor="method-local" className="text-sm text-gray-600">
                                                <span className="font-medium">Local (@imgly)</span> - Gratis, más lento
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="method-api"
                                                name="bgMethod"
                                                checked={bgMethod === 'api'}
                                                onChange={() => setBgMethod('api')}
                                                className="text-pink-600"
                                            />
                                            <label htmlFor="method-api" className="text-sm text-gray-600">
                                                <span className="font-medium">API (Poof)</span> - Más rápido, requiere API key
                                            </label>
                                        </div>
                                        
                                        {bgMethod === 'api' && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    API Key de Poof (api.poof.bg)
                                                </label>
                                                <input
                                                    type="password"
                                                    value={apiKey}
                                                    onChange={(e) => setApiKey(e.target.value)}
                                                    placeholder="Ingresa tu API key..."
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                />
                                                <button
                                                    onClick={handleSaveApiKey}
                                                    className="mt-2 w-full py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700"
                                                >
                                                    Guardar API Key
                                                </button>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Crear cuenta en poof.bg para obtener API key
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {customBrands.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {customBrands.map((brand) => (
                                        <div key={brand.id} className="relative group">
                                            <button
                                                onClick={() => handleAddCustomImage(brand.src)}
                                                className="w-full aspect-square rounded-xl border-2 border-gray-200 hover:border-pink-400 transition-all overflow-hidden flex items-center justify-center bg-gray50"
                                            >
                                                {brand.src.startsWith('data:image/png') ? (
                                                    <img src={brand.src} alt={brand.name} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <img src={brand.src} alt={brand.name} className="w-full h-full object-cover" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomBrand(brand.id)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <p className="text-xs text-gray-600 mt-1 truncate text-center">{brand.name}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No tienes logos subidos</p>
                                    <p className="text-xs">Sube tu marca para usarla siempre</p>
                                </div>
                            )}
                        </div>
                    )}
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
