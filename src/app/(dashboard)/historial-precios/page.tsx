import { HistorialPreciosView } from "@/components/historial-precios/historial-precios-view";

export default function HistorialPreciosPage() {
  return (
    <div className="space-y-1">
      <div>
        <h2 className="font-display text-lg font-semibold text-text">Auditoría de Precios</h2>
        <p className="text-sm text-text-dim">
          Historial completo de cambios de precio: cargas manuales, overrides de decant,
          recálculos y actualizaciones masivas.
        </p>
      </div>
      <div className="pt-4">
        <HistorialPreciosView />
      </div>
    </div>
  );
}