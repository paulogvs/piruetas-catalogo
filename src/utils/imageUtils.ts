import { removeBackground, Config } from '@imgly/background-removal';

/**
 * Removes the background from an image using @imgly/background-removal.
 * @param source The image source (Blob, File, URL, etc.)
 * @param onProgress Optional callback for progress updates
 * @returns A promise that resolves to a data URL of the processed image
 */
export async function removeBackgroundLocal(
    source: Blob | File | string,
    onProgress?: (key: string, current: number, total: number) => void
): Promise<string> {
    const config: Config = {
        progress: onProgress
    };

    const resultBlob = await removeBackground(source, config);

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
    });
}
