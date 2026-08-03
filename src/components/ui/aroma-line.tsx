type AromaLineProps = {
  className?: string;
};

export function AromaLine({ className }: AromaLineProps) {
  return (
    <svg viewBox="0 0 240 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 18C22 6 40 6 58 14C76 22 94 22 112 12C130 2 148 2 166 10C184 18 202 18 220 8C226 5 232 5 238 8"
        stroke="url(#aroma-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="aroma-gradient" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="15%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="85%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}