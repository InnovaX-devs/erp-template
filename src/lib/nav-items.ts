import type { LucideIcon } from "lucide-react";
import {
  Users,
  FlaskConical,
  PackagePlus,
  Receipt,
  Calculator,
  Tag,
  Wallet,
  History,
  FileText,
  Droplets,
  ShoppingCart,
  Package,
} from "lucide-react";

export type NavLeaf = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
};

export type NavItem = NavLeaf | NavGroup;

export function esGrupo(item: NavItem): item is NavGroup {
  return "children" in item;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Clientes", href: "/clientes", icon: Users },
  {
    label: "Productos",
    icon: FlaskConical,
    children: [
      { label: "Productos", href: "/productos", icon: FlaskConical },
      { label: "Marcas y Categorías", href: "/marcas-categorias", icon: Tag },
      { label: "Historial de precios", href: "/historial-precios", icon: History },
    ],
  },
  { label: "Compras", href: "/compras", icon: PackagePlus },
  {
    label: "Ventas",
    icon: Receipt,
    children: [
      { label: "Nueva Venta", href: "/ventas", icon: ShoppingCart },
      { label: "Historial de Ventas", href: "/ventas/historial", icon: Receipt },
      { label: "Pedidos", href: "/ventas/pedidos", icon: Package },
    ],
  },
  { label: "Presupuestos", href: "/presupuestos", icon: FileText  },
  {
    label: "Finanzas",
    icon: Calculator,
    children: [
      { label: "Cuentas Financieras", href: "/finanzas", icon: Calculator },
      { label: "Flujo de Caja", href: "/finanzas/flujo-caja", icon: Calculator },
      { label: "Gastos", href: "/finanzas/gastos", icon: Wallet },
    ],
  },
  { label: "Reportes", href: "/reportes", icon: Droplets },
  { label: "Configuración", href: "/configuracion", icon: PackagePlus },
  
];