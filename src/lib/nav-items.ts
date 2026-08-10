import type { LucideIcon } from "lucide-react";
import { Users, FlaskConical, PackagePlus, Receipt, Calculator, Tag } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Productos", href: "/productos", icon: FlaskConical },
  { label: "Marcas y Categorias", href: "/marcas-categorias", icon: Tag },
  { label: "Compras", href: "/compras", icon: PackagePlus },
  { label: "Ventas", href: "/ventas", icon: Receipt },
  { label: "Contabilidad", href: "/finanzas", icon: Calculator },
];