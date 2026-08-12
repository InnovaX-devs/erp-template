"use client";

import { useEffect, useRef, useState } from "react";

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
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
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
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#021541]"
      >
        <span className="truncate">{seleccionado?.label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-[#45464f] transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {abierto && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#c5c6d0] bg-white py-1 text-sm shadow-lg"
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
              className={`cursor-pointer px-3 py-2 ${
                o.value === value
                  ? "bg-[#021541] text-white"
                  : i === focoIndex
                    ? "bg-[#F1F5F9] text-[#191c1e]"
                    : "text-[#191c1e]"
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}