"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";

export type BarcodeInputHandle = {
  confirm: () => void;
  focus: () => void;
};

type OmittedKeys = "value" | "onChange" | "onKeyDown" | "type";

type BarcodeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, OmittedKeys> & {
  value: string;
  onChange: (value: string) => void;
  onScan?: (value: string) => void;
  clearOnScan?: boolean;
};

export const BarcodeInput = forwardRef<BarcodeInputHandle, BarcodeInputProps>(
  function BarcodeInput(
    { value, onChange, onScan, clearOnScan = false, ...inputProps },
    forwardedRef
  ) {
    const internalRef = useRef<HTMLInputElement>(null);

    function confirmValue() {
      const finalValue = value.trim();
      if (finalValue) {
        onScan?.(finalValue);
      }

      if (clearOnScan) {
        onChange("");
      }

      requestAnimationFrame(() => {
        internalRef.current?.focus();
      });
    }

    useImperativeHandle(forwardedRef, () => ({
      confirm: confirmValue,
      focus: () => internalRef.current?.focus(),
    }));

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      event.stopPropagation();
      confirmValue();
    }

    return (
      <input
        {...inputProps}
        ref={internalRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    );
  }
);