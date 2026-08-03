import { LoginForm } from "@/components/auth/login-form";
import { AromaLine } from "@/components/ui/aroma-line";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
      {/* Panel de marca */}
      <div className="relative flex flex-col justify-between bg-ink px-8 py-10 text-ivory md:w-[42%] md:px-14 md:py-16">
        <span className="font-display text-2xl tracking-wide">Esencia</span>

        <div className="hidden md:block">
          <p className="font-display text-3xl italic leading-snug text-ivory/90">
            Cada frasco cuenta
            <br />
            una historia distinta.
          </p>
          <AromaLine className="mt-8 w-40 text-amber/70" />
        </div>

        <p className="text-xs text-ivory/40">
          Panel administrativo · uso interno
        </p>
      </div>

      {/* Panel de formulario */}
      <div className="flex flex-1 items-center justify-center bg-ivory px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl text-ink">Bienvenido/a</h1>
            <p className="mt-1 text-sm text-ink/50">
              Ingresá tus credenciales para acceder al panel.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
