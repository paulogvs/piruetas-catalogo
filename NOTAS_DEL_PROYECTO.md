# 🚨 LEER SIEMPRE ESTE ARCHIVO / ALWAYS READ THIS FILE

> **INSTRUCCIÓN PARA EL ASISTENTE IA:** Antes de hacer cualquier cambio, leer este archivo completo para entender el estado del proyecto, su arquitectura y la última sesión de trabajo.

---

## 📌 Estado del Proyecto: **Versión React Optimizada** (Feb 2026)

### ¿Qué ES este proyecto?
**PIRÜETAS CON ESTILO** — Editor de catálogo de moda profesional optimizado para dispositivos móviles.  
Permite a la usuaria (Andreína) crear imágenes de producto de alta calidad directamente desde el navegador de su celular, eliminando fondos, añadiendo texto artístico y stickers.

### Stack Tecnológico
| Tecnología | Uso |
|---|---|
| **React 19** | Framework principal |
| **TypeScript** | Desarrollo robusto y tipado |
| **Vite 6** | Servidor de desarrollo y build ultra-rápido |
| **Tailwind v4** | Sistema de estilos moderno y minimalista |
| **Konva / react-konva** | Motor de renderizado para el canvas (drag, drop, resize) |
| **@imgly/background-removal** | Procesamiento de imágenes para quitar fondo (100% local) |
| **lucide-react** | Set de íconos profesionales |

---

## 📁 Estructura del Proyecto

```
c:\PROGRAMAS\PIRUETAS CON ESTILO\
├── index.html              ← Entrada de la aplicación
├── vite.config.ts          ← Configuración de Vite
├── tsconfig.json           ← Configuración de TypeScript
├── package.json            ← Dependencias y scripts
├── actualizar_github.bat   ← Herramienta de despliegue automático
├── NOTAS_DEL_PROYECTO.md   ← Este archivo informativo
│
└── src/
    ├── main.tsx            ← Punto de montaje de React
    ├── App.tsx             ← Aplicación principal y gestión de estado
    ├── types.ts            ← Definiciones de tipos y formatos de imagen
    ├── index.css           ← Estilos globales (Tailwind v4)
    └── components/
        ├── CanvasEditor.tsx     ← Editor visual interactivo
        ├── Modal.tsx            ← Componente modal base mobile-ready
        ├── Button.tsx           ← Librería de botones personalizada
        ├── ImageUploadModal.tsx ← Gestión de archivos, recorte y procesado
        ├── TextConfigModal.tsx  ← Herramientas de tipografía y estilo
        ├── DownloadOptions.tsx  ← Exportación en alta resolución
        └── FormatSelector.tsx   ← Herramienta de relaciones de aspecto (Story, Post, etc.)
```

---

## 🎨 Funcionalidades Core

| Característica | Detalle |
|---|---|
| **Subida Inteligente** | Soporte para archivos, pegar desde portapapeles y Drag & Drop |
| **Recorte de Precisión** | Herramienta integrada para ajustar el encuadre inicial |
| **Eliminación de Fondo** | Procesamiento por Machine Learning ejecutado localmente en el navegador |
| **Editor Tipográfico** | Inserción de textos con control de color, fondo y opacidad |
| **Canvas Interactivo** | Manipulación intuitiva de elementos (arrastrar, rotar, escalar) |
| **Capas Dinámicas** | Control de profundidad (traer al frente / enviar atrás) |
| **Persistencia Local** | Auto-guardado de sesiones para no perder el trabajo |
| **Undo/Redo** | Historial de acciones para corregir errores rápidamente |
| **Multiformato** | Ajuste instantáneo a Story (9:16), Post (4:5), Cuadrado (1:1) o Landscape (16:9) |
| **Exportación Profesional** | Descarga en PNG de alta resolución con marca de agua automática |

---

## 🚀 Guía de Desarrollo

```bash
# Instalación de dependencias (necesario solo la primera vez)
npm install

# Iniciar servidor local
npm run dev
```

---

## 📤 Despliegue (GitHub & Vercel)

El proyecto está configurado para despliegue continuo mediante Vercel:
1. Realiza los cambios necesarios en el código.
2. Ejecuta `actualizar_github.bat` para subir los cambios a la rama `main` de GitHub.
3. Vercel detectará el cambio y actualizará el sitio en segundos.

---

## ✅ Historial de Evolución

### Febrero 2026 - Gran Unificación y Limpieza
- Se eliminó el código legacy basado en Vanilla JS (`main.js`, `style.css`).
- Se eliminó la carpeta `ai-studio/` tras completar la migración de sus funcionalidades.
- Unificación total bajo React 19 + Konva.
- Documentación actualizada y estructura de archivos optimizada.

---
*Última revisión: 24 de febrero de 2026*
