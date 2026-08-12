import type { LucideIcon } from "lucide-react";
import {Users, FlaskConical, PackagePlus, Receipt, Calculator, Tag, Wallet, History, FileText, Droplets,} from "lucide-react";

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
  { label: "Presupuestos", href: "/presupuestos", icon: FileText },
  { label: "Contabilidad", href: "/finanzas", icon: Calculator },
  { label: "Flujo de Caja", href: "/finanzas/flujo-caja", icon: Calculator },
  { label: "Gastos", href: "/finanzas/gastos", icon: Wallet },
  { label: "Historial de Ventas", href: "/ventas/historial", icon: Receipt },
  { label: "Pedidos", href: "/ventas/pedidos", icon: PackagePlus },
  { label: "Historial de precios", href: "/historial-precios", icon: History },
  { label: "Reporte de Decants", href: "/reportes/decants", icon: Droplets },
];