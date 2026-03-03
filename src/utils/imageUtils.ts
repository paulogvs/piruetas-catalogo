// Global worker instance
let backgroundRemovalWorker: Worker | null = null;
let currentResolve: ((value: string) => void) | null = null;
let currentReject: ((reason: any) => void) | null = null;
let progressCallback: ((key: string, current: number, total: number) => void) | null = null;
let isWorkerReady = false;
let pendingRequest: any = null;

/**
 * Initializes the background removal worker.
 */
function initWorker() {
    if (backgroundRemovalWorker) return;

    // Use Vite's worker import syntax
    backgroundRemovalWorker = new Worker(new URL('../workers/backgroundRemovalWorker.ts', import.meta.url), {
        type: 'module'
    });

    backgroundRemovalWorker.onmessage = (event: MessageEvent) => {
        const { type, status, message, progress, blob, mask, width, height, error } = event.data;

        if (type === 'status') {
            console.log(`[Worker Status]: ${status} - ${message}`);

            if (status === 'ready') {
                isWorkerReady = true;
                if (pendingRequest) {
                    backgroundRemovalWorker!.postMessage(pendingRequest);
                    pendingRequest = null;
                }
            }

            // Map status to progress for simple progress callback
            if (status === 'loading' && progress !== undefined && progressCallback) {
                progressCallback('loading_model', progress, 100);
            }
        }

        if (type === 'result' && mask && currentResolve) {
            console.log('[Worker Utility]: Result received, applying mask...');
            applyMask(mask, width, height).then(dataUrl => {
                if (currentResolve) currentResolve(dataUrl);
                currentResolve = null;
                currentReject = null;
                cleanupWorkerUrl();
            }).catch(err => {
                console.error('[Worker Utility]: Mask application failed:', err);
                if (currentReject) currentReject(err);
                currentResolve = null;
                currentReject = null;
                cleanupWorkerUrl();
            });
        }

        if (type === 'error' && currentReject) {
            console.error('[Worker Error Payload]:', event.data);
            currentReject(new Error(error || message || 'Error interno del procesador de imágenes.'));
            currentResolve = null;
            currentReject = null;

            // Cleanup Object URL if it was created
            const worker = backgroundRemovalWorker as any;
            if (worker?.lastImageUrl) {
                URL.revokeObjectURL(worker.lastImageUrl);
                worker.lastImageUrl = null;
            }
        }
    };

    backgroundRemovalWorker.onerror = (error) => {
        console.error('[Worker Error]:', error);
        if (currentReject) {
            currentReject(error);
            currentResolve = null;
            currentReject = null;
        }
    };

    // Initialize the model
    backgroundRemovalWorker.postMessage({ type: 'init' });
}

function cleanupWorkerUrl() {
    const worker = backgroundRemovalWorker as any;
    if (worker?.lastImageUrl) {
        URL.revokeObjectURL(worker.lastImageUrl);
        worker.lastImageUrl = null;
    }
}

async function applyMask(maskData: Uint8Array, width: number, height: number): Promise<string> {
    const worker = backgroundRemovalWorker as any;
    const sourceUrl = worker.lastImageUrl;
    if (!sourceUrl) throw new Error('Source image lost');

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context failed'));

            // 1. Create a mask canvas to apply feathering
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height;
            const mCtx = maskCanvas.getContext('2d');
            if (!mCtx) return reject(new Error('Mask canvas context failed'));

            const maskImageData = mCtx.createImageData(width, height);
            for (let i = 0; i < maskData.length; i++) {
                const val = maskData[i];
                maskImageData.data[i * 4] = val;
                maskImageData.data[i * 4 + 1] = val;
                maskImageData.data[i * 4 + 2] = val;
                maskImageData.data[i * 4 + 3] = 255;
            }
            mCtx.putImageData(maskImageData, 0, 0);

            // 2. Final composition
            // Draw original image
            ctx.drawImage(img, 0, 0, width, height);

            // Apply feathered mask using globalCompositeOperation
            ctx.globalCompositeOperation = 'destination-in';

            // Subtle blur for edge feathering (makes it look more professional/natural)
            ctx.filter = 'blur(1.5px)';
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.filter = 'none';

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load original image for masking'));
        img.src = sourceUrl;
    });
}

/**
 * Removes the background from an image using Transformers.js via a Web Worker.
 * @param source The image source (Blob, File, URL, or data URL)
 * @param onProgress Optional callback for progress updates
 * @returns A promise that resolves to a data URL of the processed image
 */
export async function removeBackgroundLocal(
    source: Blob | File | string,
    onProgress?: (key: string, current: number, total: number) => void
): Promise<string> {
    initWorker();

    if (currentResolve || currentReject) {
        if (currentReject) currentReject(new Error('Ya hay un proceso en curso.'));
        currentResolve = null;
        currentReject = null;
    }

    progressCallback = onProgress || null;

    let finalImageUrl: string;
    let isObjectUrl = false;

    // Optimization: Resize image before sending to worker to save memory
    // Reduced to 800px for maximum mobile compatibility
    if (typeof source !== 'string') {
        finalImageUrl = await resizeImage(source, 800);
        isObjectUrl = true;
    } else if (source.startsWith('data:')) {
        // If it's a data URL, also resize it
        const blob = await (await fetch(source)).blob();
        finalImageUrl = await resizeImage(blob, 800);
        isObjectUrl = true;
    } else {
        finalImageUrl = source;
    }

    return new Promise((resolve, reject) => {
        currentResolve = resolve;
        currentReject = reject;

        const payload = { type: 'remove_bg', image: finalImageUrl };

        if (isObjectUrl) (backgroundRemovalWorker as any).lastImageUrl = finalImageUrl;

        if (isWorkerReady) {
            backgroundRemovalWorker!.postMessage(payload);
        } else {
            pendingRequest = payload;
        }
    });
}

async function resizeImage(blob: Blob, maxDim: number): Promise<string> {
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > maxDim || h > maxDim) {
                if (w > h) { h = (h / w) * maxDim; w = maxDim; }
                else { w = (w / h) * maxDim; h = maxDim; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
        img.src = url;
    });
}
