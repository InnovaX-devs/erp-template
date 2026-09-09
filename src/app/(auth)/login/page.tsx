import { LoginForm } from "@/components/auth/login-form";
import { DevCredit } from "@/components/shared/dev-credit";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl text-ink">Bienvenido/a</h1>
          <p className="mt-1 text-sm text-ink/50">
            Ingresá tus credenciales para acceder al panel.
          </p>
        </div>

        <LoginForm />
      </div>

      <div className="mt-10">
        <DevCredit />
      </div>
    </div>
  );
}
