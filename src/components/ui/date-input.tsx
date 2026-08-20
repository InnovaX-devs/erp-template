"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DateInputProps {
  /** Modo controlado: si se provee (incluso ""), el componente refleja este valor. */
  value?: string; // "yyyy-mm-dd"
  /** Modo no controlado: valor inicial, el componente maneja su propio estado luego. */
  defaultValue?: string; // "yyyy-mm-dd"
  onChange?: (value: string) => void;
  /** Fecha mínima seleccionable (ISO). Días anteriores quedan deshabilitados. */
  min?: string;
  /** Fecha máxima seleccionable (ISO). Días posteriores quedan deshabilitados. */
  max?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const DIAS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function parseISO(value?: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function mismaFecha(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DateInput({
  value,
  defaultValue,
  onChange,
  min,
  max,
  className,
  placeholder = "Seleccionar fecha",
  disabled = false,
}: DateInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? "");
  const currentValue = isControlled ? value : internalValue;
  const selected = parseISO(currentValue);
  const minDate = parseISO(min);
  const maxDate = parseISO(max);

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(selected ?? new Date());
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const POPOVER_WIDTH = 300;
  const MARGIN = 8;

  const calcularPosicion = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();

    let left = rect.left;
    if (left + POPOVER_WIDTH + MARGIN > window.innerWidth) {
      left = window.innerWidth - POPOVER_WIDTH - MARGIN;
    }
    if (left < MARGIN) left = MARGIN;

    const popoverHeight = popoverRef.current?.offsetHeight ?? 360;
    let top = rect.bottom + 4;
    if (top + popoverHeight + MARGIN > window.innerHeight) {
      const topAbove = rect.top - popoverHeight - 4;
      top = topAbove >= MARGIN ? topAbove : Math.max(MARGIN, window.innerHeight - popoverHeight - MARGIN);
    }
    setCoords({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    setViewMonth(selected ?? new Date());
    calcularPosicion();
    window.addEventListener("resize", calcularPosicion);
    window.addEventListener("scroll", calcularPosicion, true);
    return () => {
      window.removeEventListener("resize", calcularPosicion);
      window.removeEventListener("scroll", calcularPosicion, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function emitir(iso: string) {
    if (!isControlled) setInternalValue(iso);
    onChange?.(iso);
  }

  function estaDeshabilitado(day: number): boolean {
    const fecha = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    if (minDate && fecha < minDate) return true;
    if (maxDate && fecha > maxDate) return true;
    return false;
  }

  function seleccionarDia(day: number) {
    if (estaDeshabilitado(day)) return;
    const nueva = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    setOpen(false);
    emitir(toISO(nueva));
  }

  function limpiar() {
    setOpen(false);
    emitir("");
  }

  function irAHoy() {
    const hoy = new Date();
    setOpen(false);
    emitir(toISO(hoy));
  }

  const primerDiaMes = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const offset = (primerDiaMes.getDay() + 6) % 7; // Lunes = 0
  const diasEnMes = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const celdas: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  const triggerClassName = className
    ? className
    : "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text";

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`min-w-0 text-left disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}
      >
        {selected ? formatDisplay(selected) : <span className="text-text-dim">{placeholder}</span>}
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, width: POPOVER_WIDTH }}
            className="z-50 rounded-lg border border-border bg-white p-3 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                className="rounded p-1 hover:bg-surface"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold capitalize text-text">
                {MESES[viewMonth.getMonth()]} de {viewMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                className="rounded p-1 hover:bg-surface"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold text-text-dim">
              {DIAS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
              {celdas.map((day, i) => {
                if (day === null) return <span key={`empty-${i}`} />;
                const fechaCelda = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                const esSeleccionado = selected ? mismaFecha(selected, fechaCelda) : false;
                const deshabilitado = estaDeshabilitado(day);
                return (
                  <button
                    type="button"
                    key={day}
                    disabled={deshabilitado}
                    onClick={() => seleccionarDia(day)}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                      esSeleccionado
                        ? "bg-ink text-ivory"
                        : deshabilitado
                          ? "cursor-not-allowed text-text-dim/40"
                          : "text-text hover:bg-surface"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
              <button type="button" onClick={limpiar} className="text-amber hover:underline">
                Borrar
              </button>
              <button type="button" onClick={irAHoy} className="text-amber hover:underline">
                Hoy
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}