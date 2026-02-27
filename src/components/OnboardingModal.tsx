import React from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Sube tu imagen",
    description: "Arrastra una foto, pégala del portapapeles o selecciónala de tu galería"
  },
  {
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: "Edita tu creación",
    description: "Añade textos, emojis y ajusta el tamaño con gestos táctiles"
  },
  {
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "Exporta en HD",
    description: "Descarga tu diseño en alta resolución listo para Instagram"
  }
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[var(--color-primary)] to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl font-serif italic">P</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido a <span className="text-[var(--color-primary)]">PIRÜETAS</span>
            </h2>
            <p className="text-gray-500">
              Crea imágenes de moda profesionales en segundos
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-pink-200 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-blue-400 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all"
          >
            ¡Empezar a crear!
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            Toca fuera para cerrar
          </p>
        </div>
        
        <div className="h-1.5 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-blue-400 w-full animate-progress" />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        .animate-progress { animation: progress 2.5s ease-in-out; }
      `}</style>
    </div>
  );
}
