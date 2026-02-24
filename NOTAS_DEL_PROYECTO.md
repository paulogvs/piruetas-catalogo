# 🚨 LEER SIEMPRE ESTE ARCHIVO / ALWAYS READ THIS FILE
Este archivo es la **fuente de verdad** del proyecto "PIRÜETAS CON ESTILO". Cada vez que iniciemos una nueva conversación o sesión de trabajo, el asistente IA debe leer este archivo por completo para entender el estado actual, las funcionalidades implementadas y los objetivos pendientes.

---

# NOTAS DEL PROYECTO: PIRÜETAS CON ESTILO

## 🎯 Objetivos Principales
- [x] Crear un lienzo (canvas) con fondo blanco.
- [x] Agregar botones para Imágenes y Texto.
- [x] Permitir recortar imágenes antes de agregarlas.
- [x] **Quitar fondo automáticamente** (Local ML) - Estilo Sticker.
- [x] Editar stickers: rotar, escalar, mover y eliminar.
- [x] Configurar texto: color de letra, color de fondo y opacidad.
- [x] Marca de agua automática: "PIRÜETAS CON ESTILO".
- [x] Descarga profesional en alta resolución (independiente del zoom).
- [x] Formatos: Story (9:16), Post (4:5), Cuadrado (1:1), Landscape (16:9).

## ✅ Avances Logrados y Mejoras Pulidas
- **Motor de Canvas**: Fabric.js v6.5.0 configurado con soporte para filtros de imagen.
- **Filtros de Imagen**: Control de Brillo, Contraste y Saturación (Doble clic en imagen).
- **Gestión de Capas**: Botones para Traer al frente y Enviar al fondo.
- **Biblioteca de Stickers**: Panel con iconos/emojis rápidos con efecto de entrada "Pop".
- **UX/UI Premium**: 
    - Tipografía: 'Outfit' y 'Playfair Display' (Google Fonts).
    - Guías de Alineación: Snapping automático al centro.
    - Persistencia Local: Auto-guardado en `localStorage`.
    - Animaciones: Efectos de entrada suaves para nuevos elementos.
- **Responsividad**: Interfaz móvil funcional con sidebar deslizable.
- **Exportación PRO**: Factor de escala dinámico para garantizar 1080p+ en las descargas.

## 🚀 Próximos pasos
- [ ] **Despliegue**: Subir a Vercel mediante integración con GitHub.
- [ ] **Librería de Marca**: Añadir carpeta de imágenes locales (PNG) con logos e iconos de la tienda.
- [ ] **Copywriting**: Ampliar frases mágicas o añadir IA si el usuario lo solicita.

## 🤖 Notas para IA (Contexto)
- Proyecto desarrollado con **Vite** (Vanilla JS).
- Dependencias clave: `fabric`, `@imgly/background-removal`, `cropperjs`.
- El procesamiento de imágenes ocurre 100% en el cliente (navegador). No hay backend.

## 📝 Registro de Cambios
- **2026-02-24**: Gran actualización de pulido. Implementación de filtros, capas, guías de alineación, stickers y sistema de exportación en alta resolución. Creación de script de automatización para GitHub.
