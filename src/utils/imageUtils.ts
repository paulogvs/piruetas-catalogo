// Global worker instance
let backgroundRemovalWorker: Worker | null = null;
let currentResolve: ((value: string) => void) | null = null;
let currentReject: ((reason: any) => void) | null = null;
let progressCallback: ((key: string, current: number, total: number) => void) | null = null;

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
        const { type, status, message, progress, blob, error } = event.data;

        if (type === 'status') {
            console.log(`[Worker Status]: ${status} - ${message}`);
            // Map status to progress for simple progress callback
            if (status === 'loading' && progress !== undefined && progressCallback) {
                progressCallback('loading_model', progress, 100);
            }
        }

        if (type === 'result' && blob && currentResolve) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (currentResolve) currentResolve(reader.result as string);
                currentResolve = null;
                currentReject = null;

                // Cleanup Object URL if it was created
                const worker = backgroundRemovalWorker as any;
                if (worker?.lastImageUrl) {
                    URL.revokeObjectURL(worker.lastImageUrl);
                    worker.lastImageUrl = null;
                }
            };
            reader.onerror = () => {
                if (currentReject) currentReject(new Error('Failed to read resulting blob'));
                currentResolve = null;
                currentReject = null;
            };
            reader.readAsDataURL(blob);
        }

        if (type === 'error' && currentReject) {
            currentReject(new Error(error || message || 'Unknown worker error'));
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

    // If there is already a pending request, reject it to avoid confusion
    if (currentResolve || currentReject) {
        if (currentReject) currentReject(new Error('New background removal requested before previous finished'));
        currentResolve = null;
        currentReject = null;
    }

    progressCallback = onProgress || null;

    let imageUrl: string;
    let isObjectUrl = false;
    if (typeof source !== 'string') {
        imageUrl = URL.createObjectURL(source);
        isObjectUrl = true;
    } else {
        imageUrl = source;
    }

    return new Promise((resolve, reject) => {
        currentResolve = resolve;
        currentReject = reject;

        // Store for cleanup
        if (isObjectUrl) {
            (backgroundRemovalWorker as any).lastImageUrl = imageUrl;
        }

        backgroundRemovalWorker!.postMessage({
            type: 'remove_bg',
            image: imageUrl
        });
    });
}
