export type StickerType = 'image' | 'text';

export interface StickerData {
    id: string;
    type: StickerType;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    // Image specific
    src?: string;
    width?: number;
    height?: number;
    // Text specific
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    align?: 'left' | 'center' | 'right';
    fontStyle?: string;
    backgroundStyle?: 'none' | 'per-word';
    backgroundColor?: string;
}

export interface CanvasSize {
    width: number;
    height: number;
    label: string;
}

export const FORMATS: Record<string, CanvasSize> = {
    square: { width: 1080, height: 1080, label: '1:1 Cuadrado' },
    story: { width: 1080, height: 1920, label: '9:16 Story' },
    post: { width: 1080, height: 1350, label: '4:5 Post' },
    landscape: { width: 1920, height: 1080, label: '16:9 Paisaje' },
};
