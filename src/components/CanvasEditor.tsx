import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Line as KonvaLine } from 'react-konva';
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

    // If background per word is enabled, we render a custom group
    if (sticker.backgroundStyle === 'per-word') {
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
                    sceneFunc={(context, shape) => {
                        const text = shape.getAttr('text');
                        const fontSize = shape.getAttr('fontSize');
                        const fontFamily = shape.getAttr('fontFamily');
                        const fill = shape.getAttr('fill');
                        const bgColor = shape.getAttr('backgroundColor') || '#475569';
                        const align = shape.getAttr('align') || 'center';

                        context.font = `${fontSize}px ${fontFamily}`;
                        context.textBaseline = 'middle';

                        const words = text.split(/\s+/);
                        const metrics = words.map((w: string) => context.measureText(w));
                        const totalWidth = metrics.reduce((sum: number, m: TextMetrics) => sum + m.width + fontSize * 0.4, 0);

                        let currentX = 0;
                        if (align === 'center') currentX = -totalWidth / 2 + (shape.width() / 2);
                        if (align === 'right') currentX = shape.width() - totalWidth;

                        const paddingX = fontSize * 0.25;
                        const paddingY = fontSize * 0.15;
                        const radius = fontSize * 0.35;

                        words.forEach((word: string, i: number) => {
                            const wWidth = metrics[i].width;
                            const hHeight = fontSize;

                            // Draw Background with shadow
                            context.save();
                            context.shadowColor = 'rgba(0,0,0,0.1)';
                            context.shadowBlur = 10;
                            context.shadowOffsetY = 4;

                            context.beginPath();
                            const rectX = currentX - paddingX;
                            const rectY = -hHeight / 2 + (fontSize * 0.5) - paddingY;
                            const rectW = wWidth + paddingX * 2;
                            const rectH = hHeight + paddingY * 2;

                            context.moveTo(rectX + radius, rectY);
                            context.lineTo(rectX + rectW - radius, rectY);
                            context.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
                            context.lineTo(rectX + rectW, rectY + rectH - radius);
                            context.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
                            context.lineTo(rectX + radius, rectY + rectH);
                            context.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
                            context.lineTo(rectX, rectY + radius);
                            context.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
                            context.closePath();

                            context.fillStyle = bgColor;
                            context.fill();
                            context.restore();

                            // Draw Text
                            context.fillStyle = fill || '#000000';
                            context.fillText(word, currentX, fontSize * 0.5);

                            currentX += wWidth + (paddingX * 2) + fontSize * 0.2;
                        });
                    }}
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
                            width: Math.max(10, node.width() * scaleX),
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
    }

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
                        width: Math.max(10, node.width() * scaleX),
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
    const [guides, setGuides] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
    
    // Touch gesture refs
    const touchRef = useRef<{
        initialDistance: number;
        initialAngle: number;
        initialScale: number;
        initialRotation: number;
        active: boolean;
    }>({ initialDistance: 0, initialAngle: 0, initialScale: 1, initialRotation: 0, active: false });

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

    const handleDragMove = (e: any) => {
        const node = e.target;
        const stage = node.getStage();
        if (!stage) return;

        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const snapDist = 20; // Pixels to trigger snap

        let newGuides = { x: null as number | null, y: null as number | null };

        // Horizontal Snapping (Center X)
        const nodeCenterX = node.x() + (node.width() * node.scaleX()) / 2;
        if (Math.abs(nodeCenterX - centerX) < snapDist) {
            node.x(centerX - (node.width() * node.scaleX()) / 2);
            newGuides.x = centerX;
        }

        // Vertical Snapping (Center Y)
        const nodeCenterY = node.y() + (node.height() * node.scaleY()) / 2;
        if (Math.abs(nodeCenterY - centerY) < snapDist) {
            node.y(centerY - (node.height() * node.scaleY()) / 2);
            newGuides.y = centerY;
        }

        setGuides(newGuides);
    };

    const handleDragEnd = (e: any, sticker: StickerData, onChange: any) => {
        setGuides({ x: null, y: null });
        onChange({ ...sticker, x: e.target.x(), y: e.target.y() });
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
                    onTouchStart={(e) => {
                        checkDeselect(e);
                    }}
                    onTouchMove={(e) => {
                        // Multi-touch logic for pinch/rotate
                        if (e.evt.touches.length === 2 && selectedId) {
                            e.evt.preventDefault();
                            
                            const touch1 = e.evt.touches[0];
                            const touch2 = e.evt.touches[1];

                            const p1 = { x: touch1.clientX, y: touch1.clientY };
                            const p2 = { x: touch2.clientX, y: touch2.clientY };

                            // Calculate current distance and angle
                            const currentDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                            const currentAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

                            const sticker = stickers.find(s => s.id === selectedId);
                            if (!sticker) return;

                            // Initialize on first touch move
                            if (!touchRef.current.active) {
                                touchRef.current = {
                                    initialDistance: currentDist,
                                    initialAngle: currentAngle,
                                    initialScale: sticker.scaleX || 1,
                                    initialRotation: sticker.rotation || 0,
                                    active: true
                                };
                                return;
                            }

                            // Calculate scale change (pinch)
                            const scaleFactor = currentDist / touchRef.current.initialDistance;
                            const newScale = Math.max(0.1, Math.min(5, touchRef.current.initialScale * scaleFactor));
                            
                            // Calculate rotation change
                            const angleDiff = currentAngle - touchRef.current.initialAngle;
                            const newRotation = touchRef.current.initialRotation + angleDiff;

                            // Apply changes
                            setStickers(prev => prev.map(s => {
                                if (s.id === selectedId) {
                                    return {
                                        ...s,
                                        scaleX: newScale,
                                        scaleY: newScale,
                                        rotation: newRotation
                                    };
                                }
                                return s;
                            }));
                        }
                    }}
                    onTouchEnd={(e) => {
                        // Reset touch state when fingers lifted
                        if (e.evt.touches.length < 2) {
                            touchRef.current.active = false;
                        }
                    }}
                    ref={stageRef}
                >
                    <Layer>
                        {stickers.map((sticker, i) => {
                            const onChange = (newAttrs: any) => {
                                const s = stickers.slice();
                                s[i] = newAttrs;
                                setStickers(s);
                            };

                            if (sticker.type === 'image') {
                                return (
                                    <StickerImage
                                        key={sticker.id}
                                        sticker={sticker}
                                        isSelected={sticker.id === selectedId}
                                        onSelect={() => setSelectedId(sticker.id)}
                                        onDragMove={handleDragMove}
                                        onDragEnd={(e: any) => handleDragEnd(e, sticker, onChange)}
                                        onChange={onChange}
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
                                        onDragMove={handleDragMove}
                                        onDragEnd={(e: any) => handleDragEnd(e, sticker, onChange)}
                                        onChange={onChange}
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* Alignment Guides */}
                        {guides.x !== null && (
                            <KonvaLine
                                points={[guides.x, 0, guides.x, canvasSize.height]}
                                stroke="#ff4757"
                                strokeWidth={1 / scale}
                                dash={[5, 5]}
                            />
                        )}
                        {guides.y !== null && (
                            <KonvaLine
                                points={[0, guides.y, canvasSize.width, guides.y]}
                                stroke="#ff4757"
                                strokeWidth={1 / scale}
                                dash={[5, 5]}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
