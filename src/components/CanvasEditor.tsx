import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import useImage from 'use-image';
import { StickerData, CanvasSize } from '../types';

interface CanvasEditorProps {
    stickers: StickerData[];
    setStickers: React.Dispatch<React.SetStateAction<StickerData[]>>;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    canvasSize: CanvasSize;
    stageRef: React.RefObject<any>;
}

const StickerImage = ({ sticker, isSelected, onSelect, onChange }: any) => {
    const [image] = useImage(sticker.src, 'anonymous');
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <KonvaImage
                image={image}
                {...sticker}
                ref={shapeRef}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({ ...sticker, x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...sticker,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
                    keepRatio={true}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                />
            )}
        </React.Fragment>
    );
};

const StickerText = ({ sticker, isSelected, onSelect, onChange, onDoubleClick }: any) => {
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <KonvaText
                {...sticker}
                fillAfterStrokeEnabled={true}
                ref={shapeRef}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDblClick={onDoubleClick}
                onDblTap={onDoubleClick}
                onDragEnd={(e) => {
                    onChange({ ...sticker, x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...sticker,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        fontSize: node.fontSize() * scaleX,
                        width: Math.max(5, node.width() * scaleX),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 ? oldBox : newBox)}
                />
            )}
        </React.Fragment>
    );
};

export function CanvasEditor({ stickers, setStickers, selectedId, setSelectedId, canvasSize, stageRef }: CanvasEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const containerHeight = containerRef.current.offsetHeight;
                const scaleX = containerWidth / canvasSize.width;
                const scaleY = containerHeight / canvasSize.height;
                setScale(Math.min(scaleX, scaleY, 1));
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [canvasSize]);

    const checkDeselect = (e: any) => {
        if (e.target === e.target.getStage()) setSelectedId(null);
    };

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
            <div
                style={{
                    width: canvasSize.width * scale,
                    height: canvasSize.height * scale,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
                    borderRadius: 8,
                }}
            >
                <Stage
                    width={canvasSize.width * scale}
                    height={canvasSize.height * scale}
                    scaleX={scale}
                    scaleY={scale}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                    ref={stageRef}
                >
                    <Layer>
                        {stickers.map((sticker, i) => {
                            if (sticker.type === 'image') {
                                return (
                                    <StickerImage
                                        key={sticker.id}
                                        sticker={sticker}
                                        isSelected={sticker.id === selectedId}
                                        onSelect={() => setSelectedId(sticker.id)}
                                        onChange={(newAttrs: any) => {
                                            const s = stickers.slice();
                                            s[i] = newAttrs;
                                            setStickers(s);
                                        }}
                                    />
                                );
                            }
                            if (sticker.type === 'text') {
                                return (
                                    <StickerText
                                        key={sticker.id}
                                        sticker={sticker}
                                        isSelected={sticker.id === selectedId}
                                        onSelect={() => setSelectedId(sticker.id)}
                                        onDoubleClick={() => window.dispatchEvent(new CustomEvent('edit-text', { detail: sticker.id }))}
                                        onChange={(newAttrs: any) => {
                                            const s = stickers.slice();
                                            s[i] = newAttrs;
                                            setStickers(s);
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
