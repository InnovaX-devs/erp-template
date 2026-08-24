export function DevCredit() {
  const year = new Date().getFullYear();

  return (
    <p className="text-center text-xs text-ink/40">
      © {year} · Desarrollado por{" "}
      <a
        href="https://www.instagram.com/innovax.team?igsi=NzlieWFiNWEweWRr"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-ink/60 underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink"
      >
        InnovaX
      </a>
    </p>
  );
}