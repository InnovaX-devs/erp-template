export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: "length", label: "Al menos 8 caracteres", test: (p) => p.length >= 8 },
  { id: "uppercase", label: "Una letra mayúscula", test: (p) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "Una letra minúscula", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "Un número", test: (p) => /[0-9]/.test(p) },
  {
    id: "special",
    label: "Un carácter especial (!@#$%...)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((req) => req.test(password));
}