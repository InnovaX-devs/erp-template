"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export default function Select({ value, onChange, options, className = "" }: SelectProps) {
  const [abierto, setAbierto] = useState(false);
  const [focoIndex, setFocoIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value))
  );
  const ref = useRef<HTMLDivElement>(null);

  const seleccionado = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setAbierto(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!abierto) {
        setAbierto(true);
      } else {
        onChange(options[focoIndex].value);
        setAbierto(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!abierto) {
        setAbierto(true);
      } else {
        setFocoIndex((i) => Math.min(i + 1, options.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocoIndex((i) => Math.max(i - 1, 0));
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text hover:bg-surface-hover focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className="truncate">{seleccionado?.label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-dim transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full min-w-[10rem] overflow-auto rounded-lg border border-border bg-surface py-1 text-sm shadow-lg"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setAbierto(false);
              }}
              onMouseEnter={() => setFocoIndex(i)}
              className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 ${
                o.value === value
                  ? "bg-primary/10 font-medium text-primary"
                  : i === focoIndex
                    ? "bg-surface-hover text-text"
                    : "text-text"
              }`}
            >
              {o.label}
              {o.value === value && <Check size={14} className="text-primary" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}