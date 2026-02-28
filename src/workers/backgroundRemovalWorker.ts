import { pipeline, env, RawImage } from '@huggingface/transformers';

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = true;

let remover: any = null;

// Handle messages from the main thread
self.onmessage = async (event: MessageEvent) => {
    const { type, image, model } = event.data;

    if (type === 'init') {
        try {
            self.postMessage({ type: 'status', status: 'loading', message: 'Cargando modelo de IA...', progress: 0 });

            remover = await pipeline('image-segmentation', model || 'briaai/RMBG-1.4', {
                device: 'webgpu', // Try WebGPU if available
                dtype: 'fp16', // Use fp16 for better performance on mobile
                progress_callback: (p: any) => {
                    if (p.status === 'progress') {
                        self.postMessage({
                            type: 'status',
                            status: 'loading',
                            progress: p.progress,
                            message: `Cargando: ${Math.round(p.progress)}%`
                        });
                    }
                }
            });

            self.postMessage({ type: 'status', status: 'ready', message: 'Modelo listo' });
        } catch (error: any) {
            console.error('Error loading model:', error);
            self.postMessage({ type: 'error', message: 'Error al cargar el modelo de IA: ' + error.message });
        }
    }

    if (type === 'remove_bg' && image) {
        if (!remover) {
            self.postMessage({ type: 'error', message: 'El modelo no está cargado.' });
            return;
        }

        try {
            self.postMessage({ type: 'status', status: 'processing', message: 'Analizando imagen...' });

            // Load and process image
            // Note: convert to RGBA to ensure it works with ImageData
            const img = (await RawImage.fromURL(image)).rgba();

            // Generate mask
            const output = await remover(img);

            // Create a temporary canvas to apply the mask
            const canvas = new OffscreenCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get OffscreenCanvas context');

            // Reconstruct image data correctly (now RGBA)
            const imageData = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height);
            ctx.putImageData(imageData, 0, 0);

            // Get mask data
            const maskData = output.mask.data; // uint8 array 0-255 (1 channel)

            const processedImageData = ctx.getImageData(0, 0, img.width, img.height);
            for (let i = 0; i < maskData.length; ++i) {
                // Apply the mask to the alpha channel
                processedImageData.data[i * 4 + 3] = maskData[i];
            }

            ctx.putImageData(processedImageData, 0, 0);

            // Convert to blob and send back
            const blob = await canvas.convertToBlob({ type: 'image/png' });

            self.postMessage({
                type: 'result',
                blob: blob,
                width: img.width,
                height: img.height
            });
        } catch (error: any) {
            console.error('Error processing image:', error);
            self.postMessage({ type: 'error', message: 'Error al procesar la imagen: ' + error.message });
        }
    }
};
