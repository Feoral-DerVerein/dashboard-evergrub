import React from 'react';

export const KitDigitalFooter = () => {
  return (
    <div className="w-full bg-white border-t border-gray-100 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Proyecto financiado por la Unión Europea</p>
          <p>NextGenerationEU - Plan de Recuperación, Transformación y Resiliencia</p>
        </div>

        <div className="flex items-center gap-6 hover:opacity-100 transition-opacity">
          {/* Official Logos - Using local assets to ensure uptime and avoid 403/CORS issues. 
              Please place the corresponding PNG/SVG files in public/logos/ folder. */}

          {/* Logo UE NextGeneration */}
          <img
            src="/logos/logo-eu-next-generation.png"
            alt="Financiado por la Unión Europea - NextGenerationEU"
            className="h-10 w-auto"
            onError={(e) => e.currentTarget.style.display = 'none'} // Hide if missing to avoid ugliness
          />

          {/* Logo Plan de Recuperación */}
          <img
            src="/logos/logo-prtr.png"
            alt="Plan de Recuperación, Transformación y Resiliencia"
            className="h-10 w-auto"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />

          {/* Logo Gobierno de España */}
          <img
            src="/logos/logo-gobierno-espana.png"
            alt="Gobierno de España"
            className="h-10 w-auto"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />

          {/* Logo Acelera Pyme */}
          <img
            src="/logos/logo-acelerapyme.png"
            alt="Acelera Pyme"
            className="h-10 w-auto"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />

          {/* Logo Kit Digital */}
          <img
            src="/logos/logo-kit-digital.png"
            alt="Kit Digital"
            className="h-10 w-auto"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />

          {/* Fallback Text if images missing */}
          <span className="text-xs text-muted-foreground italic hidden peer-placeholder-shown:block">
            (Logos de financiación - Añadir en /public/logos)
          </span>
        </div>
      </div>
    </div>
  );
};
