import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import Cropper from 'react-easy-crop';
import { Upload, Scissors } from 'lucide-react';
import { removeBackgroundLocal } from '../utils/imageUtils';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddImage: (dataUrl: string) => void;
}

export function ImageUploadModal({ isOpen, onClose, onAddImage }: ImageUploadModalProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingLabel, setProcessingLabel] = useState('');

    useEffect(() => {
        if (isOpen) {
            setImageSrc(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
            setIsProcessing(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!isOpen) return;
            if (e.clipboardData?.items) {
                for (const item of Array.from(e.clipboardData.items)) {
                    if (item.type.indexOf('image') !== -1) {
                        const file = item.getAsFile();
                        if (file) {
                            const reader = new FileReader();
                            reader.addEventListener('load', () => setImageSrc(reader.result as string));
                            reader.readAsDataURL(file);
                            break;
                        }
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result as string));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImg = async (): Promise<string> => {
        if (!imageSrc || !croppedAreaPixels) return imageSrc || '';
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve));
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
        return canvas.toDataURL('image/png');
    };

    const handleAddCropped = async () => {
        const croppedImage = await getCroppedImg();
        onAddImage(croppedImage);
        onClose();
    };

    const handleRemoveBg = async () => {
        setIsProcessing(true);
        setProcessingLabel('Quitando fondo… (puede tardar unos segundos)');
        try {
            const croppedImage = await getCroppedImg();
            const dataUrl = await removeBackgroundLocal(croppedImage, (key, current, total) => {
                if (key === 'loading_model') {
                    setProcessingLabel(`Cargando modelo de IA: ${Math.round(current)}%`);
                } else {
                    setProcessingLabel('Procesando imagen...');
                }
            });
            onAddImage(dataUrl);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error quitando el fondo. Intenta con otra imagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.addEventListener('load', () => setImageSrc(reader.result as string));
                reader.readAsDataURL(file);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Añadir Fotografía" maxWidth="max-w-2xl">
            {!imageSrc ? (
                <div
                    className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 hover:bg-white hover:border-primary transition-all cursor-pointer group"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('image-upload')?.click()}
                >
                    <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-gray-900 text-center font-black uppercase tracking-widest text-sm mb-2">Sube tu Imagen</p>
                    <p className="text-gray-400 text-xs text-center font-medium">ARRASRA O PEGA (CTRL+V) · JPG, PNG, WEBP</p>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" id="image-upload" />
                    <Button variant="outline" size="md" className="mt-8 border-gray-200 px-10">Explorar archivos</Button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="relative h-64 w-full bg-gray-900 rounded-2xl overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    {isProcessing && (
                        <div className="text-center text-sm text-gray-500 animate-pulse py-2">{processingLabel}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button onClick={handleRemoveBg} isLoading={isProcessing} variant="primary" className="flex-1 py-7">
                            {!isProcessing && <span className="mr-2">✨</span>} {isProcessing ? processingLabel : 'Quitar Fondo (IA)'}
                        </Button>
                        <Button onClick={handleAddCropped} className="flex-1 py-7" variant="outline" disabled={isProcessing}>
                            <Scissors className="w-4 h-4 mr-2" /> Usar así
                        </Button>
                    </div>

                    <button onClick={() => setImageSrc(null)} className="text-sm text-gray-400 hover:text-gray-600 text-center">
                        Elegir otra imagen
                    </button>
                </div>
            )}
        </Modal>
    );
}
