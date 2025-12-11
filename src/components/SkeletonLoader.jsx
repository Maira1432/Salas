import React from 'react';

// Un bloque gris simple que parpadea
export const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

// El esqueleto específico para el calendario (Columnas vacías con líneas)
export const CalendarSkeleton = ({ roomCount = 5 }) => {
  return (
    <div className="flex h-full w-full">
      {/* Columna de horas skeleton */}
      <div className="w-16 flex-shrink-0 border-r border-gray-100 dark:border-[#232A36]">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-20 border-b border-gray-100 dark:border-[#232A36]/50 p-2">
            <SkeletonBlock className="h-3 w-8" />
          </div>
        ))}
      </div>

      {/* Columnas de salas skeleton */}
      <div className="flex flex-1">
        {[...Array(roomCount)].map((_, i) => (
          <div key={i} className="flex-1 border-r border-gray-100 dark:border-[#232A36] p-2 space-y-4">
             {/* Simulamos algunos eventos cargando */}
             <div className="h-full relative">
                <SkeletonBlock className="absolute top-10 left-1 right-1 h-32 opacity-50" />
                <SkeletonBlock className="absolute top-60 left-1 right-1 h-20 opacity-50" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Esqueleto para la lista de "Mis Reservas"
export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4 w-full max-w-4xl mx-auto mt-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex justify-between items-center p-4 border border-gray-100 dark:border-[#232A36] rounded-2xl bg-white dark:bg-[#151A20]">
        <div className="space-y-2 w-1/2">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2 opacity-60" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-16 rounded-lg" />
          <SkeletonBlock className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);