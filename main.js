import { Canvas, Text, FabricImage, filters } from 'fabric';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { removeBackground } from '@imgly/background-removal';

// Configuración de dimensiones
const FORMATS = {
    story: { width: 1080, height: 1920, ratio: 9 / 16 },
    post: { width: 1080, height: 1350, ratio: 4 / 5 },
    square: { width: 1080, height: 1080, ratio: 1 / 1 },
    landscape: { width: 1920, height: 1080, ratio: 16 / 9 }
};

let activeFormat = 'story';
let canvas;

// Inicialización del Canvas
function initCanvas() {
    const canvasElement = document.getElementById('main-canvas');
    const container = document.querySelector('.canvas-wrapper');

    // Ajustar tamaño visual inicial
    const displayHeight = Math.min(window.innerHeight * 0.8, 800);
    const displayWidth = displayHeight * FORMATS[activeFormat].ratio;

    canvas = new Canvas('main-canvas', {
        width: displayWidth,
        height: displayHeight,
        backgroundColor: '#ffffff'
    });

    loadCanvas(); // Cargar desde localStorage
    updateWatermark();
    initGuides();
}

// --- PERSISTENCIA (Auto-save) ---
function saveCanvas() {
    const json = canvas.toJSON(['id', 'selectable', 'evented']);
    localStorage.setItem('piruetas_canvas', JSON.stringify(json));
}

function loadCanvas() {
    const saved = localStorage.getItem('piruetas_canvas');
    if (saved) {
        canvas.loadFromJSON(JSON.parse(saved), () => {
            canvas.renderAll();
            updateWatermark();
        });
    }
}

canvas?.on('object:modified', saveCanvas);
canvas?.on('object:added', saveCanvas);
canvas?.on('object:removed', saveCanvas);

// Marca de agua "PIRÜETAS CON ESTILO"
function updateWatermark() {
    const watermarkText = 'PIRÜETAS CON ESTILO';

    // Buscar si ya existe para actualizarla o crearla
    let watermark = canvas.getObjects().find(obj => obj.id === 'watermark');

    if (!watermark) {
        watermark = new Text(watermarkText, {
            id: 'watermark',
            fontSize: 20,
            fill: 'rgba(0,0,0,0.2)',
            fontFamily: 'Arial',
            left: canvas.width - 220,
            top: canvas.height - 40,
            selectable: false,
            evented: false
        });
        canvas.add(watermark);
    } else {
        watermark.set({
            left: canvas.width - 220,
            top: canvas.height - 40
        });
        canvas.bringToFront(watermark);
    }

    canvas.renderAll();
}

// Asegurar que la marca de agua siempre esté arriba
function bringWatermarkToFront() {
    let watermark = canvas.getObjects().find(obj => obj.id === 'watermark');
    if (watermark) {
        canvas.bringToFront(watermark);
    }
}

// Cambiar formato del lienzo
document.getElementById('canvas-format').addEventListener('change', (e) => {
    activeFormat = e.target.value;
    const displayHeight = Math.min(window.innerHeight * 0.8, 800);
    const displayWidth = displayHeight * FORMATS[activeFormat].ratio;

    canvas.setDimensions({
        width: displayWidth,
        height: displayHeight
    });

    updateWatermark();
});

// Manejo de Carga de Imagen
let cropper;
const imageInput = document.getElementById('image-input');
const cropModal = document.getElementById('crop-modal');
const cropImage = document.getElementById('crop-image');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        cropImage.src = event.target.result;
        cropModal.style.display = 'flex';

        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImage, {
            aspectRatio: NaN, // Libre por defecto
            viewMode: 1
        });
    };
    reader.readAsDataURL(file);
});

// Cancelar recorte
document.getElementById('cancel-crop').addEventListener('click', () => {
    cropModal.style.display = 'none';
    imageInput.value = '';
});

// Aceptar recorte y QUITAR FONDO
document.getElementById('apply-crop').addEventListener('click', async () => {
    const croppedCanvas = cropper.getCroppedCanvas();
    cropModal.style.display = 'none';

    // Mostrar loading
    const loading = document.getElementById('loading-overlay');
    loading.style.display = 'flex';

    try {
        // 1. Obtener imagen recortada como Blob
        const blob = await new Promise(resolve => croppedCanvas.toBlob(resolve, 'image/png'));

        // 2. Quitar fondo (USANDO ML LOCAL)
        const resultBlob = await removeBackground(blob);

        // 3. Crear URL para Fabric
        const resultUrl = URL.createObjectURL(resultBlob);

        // 4. Agregar al Canvas
        FabricImage.fromURL(resultUrl, (img) => {
            img.scaleToWidth(canvas.width * 0.5); // Tamaño inicial amigable
            img.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                cornerColor: '#38bdf8',
                cornerStyle: 'circle'
            });

            // Animación de entrada "Pop"
            img.set({ scaleX: 0, scaleY: 0 });
            canvas.add(img);
            canvas.setActiveObject(img);
            img.animate({ scaleX: canvas.width * 0.5 / img.width, scaleY: canvas.width * 0.5 / img.width }, {
                onChange: canvas.renderAll.bind(canvas),
                duration: 500,
                easing: (t, b, c, d) => { // easeOutBack-ish
                    const s = 1.70158;
                    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                }
            });
        });

    } catch (error) {
        console.error("Error procesando imagen:", error);
        alert("Hubo un error quitando el fondo. Se agregará la imagen tal cual.");

        // Fallback: agregar imagen recortada sin quitar fondo
        const fallbackUrl = croppedCanvas.toDataURL();
        FabricImage.fromURL(fallbackUrl, (img) => {
            img.scaleToWidth(canvas.width * 0.5);
            canvas.add(img);
        });
    } finally {
        loading.style.display = 'none';
        imageInput.value = '';
    }
});

// Manejo de Texto
const textModal = document.getElementById('text-modal');
const textField = document.getElementById('text-input-field');
const textColor = document.getElementById('text-color');
const textBgColor = document.getElementById('text-bg-color');
const textBgOpacity = document.getElementById('text-bg-opacity');

document.getElementById('add-text-btn').addEventListener('click', () => {
    textField.value = '';
    textModal.style.display = 'flex';
    textField.focus();
});

document.getElementById('cancel-text').addEventListener('click', () => {
    textModal.style.display = 'none';
});

const AI_SUGGESTIONS = [
    "✨ ¡Vístete con elegancia!",
    "👗 PIRÜETAS: Estilo que inspira",
    "🔥 Nueva Colección - Disponible ya",
    "💖 Estilo único para ti",
    "☁️ Calidad y Confort en cada prenda",
    "🌟 Edición Limitada",
    "🏷️ ¡Oferta Imperdible!",
    "🛍️ Tu outfit ideal está aquí",
    "✨ Look del día: Sofisticación pura",
    "💃 Brilla con luz propia",
    "🌿 Moda consciente y elegante",
    "🎀 Detalles que enamoran"
];

document.getElementById('ai-magic-btn').addEventListener('click', () => {
    const random = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)];
    textField.value = random;
});

document.getElementById('apply-text').addEventListener('click', () => {
    const content = textField.value.trim();
    if (!content) return;

    const stickerText = new Text(content, {
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
        fontSize: 40,
        fill: textColor.value,
        backgroundColor: textBgColor.value.replace('#', 'rgba(') + ',' + textBgOpacity.value + ')', // Simplificado
        padding: 10,
        cornerColor: '#38bdf8',
        cornerStyle: 'circle'
    });

    // Ajustar color de fondo con opacidad de forma correcta
    const hex = textBgColor.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    stickerText.set('backgroundColor', `rgba(${r}, ${g}, ${b}, ${textBgOpacity.value})`);

    canvas.add(stickerText);
    canvas.setActiveObject(stickerText);

    // Animación de entrada
    const originalScale = stickerText.fontSize;
    stickerText.set({ fontSize: 0 });
    stickerText.animate({ fontSize: 40 }, {
        onChange: canvas.renderAll.bind(canvas),
        duration: 400,
        easing: (t, b, c, d) => c * (t /= d) * t * t + b
    });

    textModal.style.display = 'none';
    saveCanvas();
});

// --- FILTROS DE IMAGEN ---
const filterModal = document.getElementById('filter-modal');
const brightnessInp = document.getElementById('brightness-filter');
const contrastInp = document.getElementById('contrast-filter');
const saturationInp = document.getElementById('saturation-filter');

canvas?.on('selection:created', checkFilterable);
canvas?.on('selection:updated', checkFilterable);

function checkFilterable(e) {
    const obj = e.selected[0];
    if (obj instanceof FabricImage) {
        // Mostrar botón de filtros (podríamos añadir uno dinámico o simplemente abrir el modal al hacer doble click)
        // Por ahora, permitiremos abrirlo si hay una imagen seleccionada.
    }
}

// Abrir filtros con doble click en imagen
canvas?.on('mouse:dblclick', (e) => {
    if (e.target instanceof FabricImage) {
        filterModal.style.display = 'flex';
        // Sincronizar sliders con valores actuales del objeto
        const f = e.target.filters || [];
        brightnessInp.value = f.find(x => x instanceof filters.Brightness)?.brightness || 0;
        contrastInp.value = f.find(x => x instanceof filters.Contrast)?.contrast || 0;
        saturationInp.value = f.find(x => x instanceof filters.Saturation)?.saturation || 0;
    }
});

function applyFilters() {
    const obj = canvas.getActiveObject();
    if (!obj || !(obj instanceof FabricImage)) return;

    obj.filters = [
        new filters.Brightness({ brightness: parseFloat(brightnessInp.value) }),
        new filters.Contrast({ contrast: parseFloat(contrastInp.value) }),
        new filters.Saturation({ saturation: parseFloat(saturationInp.value) })
    ];
    obj.applyFilters();
    canvas.renderAll();
    saveCanvas();
}

brightnessInp.addEventListener('input', applyFilters);
contrastInp.addEventListener('input', applyFilters);
saturationInp.addEventListener('input', applyFilters);
document.getElementById('close-filters').addEventListener('click', () => filterModal.style.display = 'none');

// --- GUÍAS DE ALINEACIÓN ---
function initGuides() {
    canvas.on('object:moving', (e) => {
        if (!document.getElementById('guides-toggle').checked) return;

        const obj = e.target;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const threshold = 10;

        // Limpiar guías previas (podríamos dibujarlas en el canvas o usar el propio feedback de Fabric)
        // Por simplicidad en este MVP, haremos "snapping"
        if (Math.abs(obj.left - centerX) < threshold) obj.set({ left: centerX });
        if (Math.abs(obj.top - centerY) < threshold) obj.set({ top: centerY });
    });
}

// --- BIBLIOTECA DE STICKERS ---
document.querySelectorAll('.sticker-item').forEach(item => {
    item.addEventListener('click', () => {
        const emoji = item.innerText;
        const stickerEffect = new Text(emoji, {
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontSize: 60,
            cornerColor: '#38bdf8',
            cornerStyle: 'circle'
        });

        // Animación de entrada
        stickerEffect.set({ scaleX: 0, scaleY: 0 });
        canvas.add(stickerEffect);
        canvas.setActiveObject(stickerEffect);
        stickerEffect.animate({ scaleX: 1, scaleY: 1 }, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 500,
            easing: (t, b, c, d) => {
                const s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            }
        });
        saveCanvas();
    });
});

// Eliminar seleccionado con Delete/Backspace
window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();
        // Evitar borrar si estamos escribiendo en un input
        if (activeObject && document.activeElement.tagName !== 'INPUT') {
            canvas.remove(activeObject);
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    }
});

// Botones de Organizar Capas
document.getElementById('bring-to-front-btn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringToFront(activeObject);
        bringWatermarkToFront();
        canvas.renderAll();
    }
});

document.getElementById('send-to-back-btn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendToBack(activeObject);
        canvas.renderAll();
    }
});

document.getElementById('delete-btn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();
    }
});

// Botón de descargar (ALTA RESOLUCIÓN)
document.getElementById('download-btn').addEventListener('click', () => {
    // 1. Deseleccionar todo para que no salgan los bordes en la foto
    canvas.discardActiveObject();
    canvas.renderAll();

    // 2. Asegurar que la marca de agua esté al frente y bien escalada antes del export
    updateWatermark();

    // 3. Calcular factor de escala para exportar a tamaño real (ej: 1080px de ancho)
    const targetWidth = FORMATS[activeFormat].width;
    const multiplier = targetWidth / canvas.width;

    // 4. Crear link de descarga con el multiplicador de resolución
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: multiplier
    });

    const link = document.createElement('a');
    link.download = `piruetas-catalogo-${activeFormat}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
});

document.title = "PIRÜETAS - Editor";
window.addEventListener('load', initCanvas);
