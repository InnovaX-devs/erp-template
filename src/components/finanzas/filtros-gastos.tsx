"use client";

interface Props {
  q: string;
  onChangeQ: (q: string) => void;
}

export function FiltrosGastos({ q, onChangeQ }: Props) {
  return (
    <input
      type="text"
      placeholder="Buscar por concepto..."
      value={q}
      onChange={(e) => onChangeQ(e.target.value)}
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none sm:w-64"
    />
  );
}