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
            console.log('[Worker]: Initializing model...');
            self.postMessage({ type: 'status', status: 'loading', message: 'Cargando modelo de IA...', progress: 0 });

            remover = await pipeline('image-segmentation', model || 'onnx-community/RMBG-1.4', {
                // Auto-detect best device (WebGPU > WASM)
                // Using q8 quantization for best balance of quality and mobile compatibility
                dtype: 'q8',
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

            console.log('[Worker]: Model ready.');
            self.postMessage({ type: 'status', status: 'ready', message: 'Modelo listo' });
        } catch (error: any) {
            console.error('[Worker]: Error loading model:', error);
            self.postMessage({ type: 'error', message: 'Error al cargar el modelo de IA: ' + error.message });
        }
    }

    if (type === 'remove_bg' && image) {
        if (!remover) {
            console.warn('[Worker]: remove_bg requested but model not ready.');
            self.postMessage({ type: 'error', message: 'El modelo no está cargado todavía.' });
            return;
        }

        try {
            console.log('[Worker]: Processing image background removal...');
            self.postMessage({ type: 'status', status: 'processing', message: 'Analizando imagen...' });

            // Load image
            const img = await RawImage.fromURL(image);

            // Generate mask
            const results = await remover(img);
            const output = Array.isArray(results) ? results[0] : results;

            if (!output || !output.mask) {
                throw new Error('No se pudo generar la máscara de fondo.');
            }

            // Send back the mask data and original image dimensions
            // We use transferable objects for performance
            const maskData = output.mask.data; // Uint8Array

            self.postMessage({
                type: 'result',
                mask: maskData,
                width: output.mask.width,
                height: output.mask.height
            }, { transfer: [maskData.buffer] } as any);
        } catch (error: any) {
            console.error('Error processing image:', error);
            self.postMessage({ type: 'error', message: 'Error al procesar la imagen: ' + error.message });
        }
    }
};
