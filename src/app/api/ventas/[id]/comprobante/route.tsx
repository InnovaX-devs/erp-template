import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { obtenerConfiguracion } from "@/lib/configuracion";
import { obtenerEmpresaIdActual } from "@/lib/empresa";
import { ComprobanteVentaDocument, type ComprobanteVentaData } from "@/lib/pdf/ComprobanteVentaDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const empresaId = await obtenerEmpresaIdActual();
  const { id } = await params;
  const ventaId = Number(id);

  if (Number.isNaN(ventaId)) {
    return NextResponse.json({ error: "ID de venta inválido" }, { status: 400 });
  }

  const [venta, configuracion] = await Promise.all([
    prisma.venta.findFirst({
      where: { id: ventaId, empresaId },
      include: {
        cliente: { select: { nombre: true, apellido: true } },
        items: {
          include: {
            producto: { select: { nombre: true } },
          },
        },
        pagos: {
          include: {
            cuenta: { select: { tipo: true } },
          },
        },
      },
    }),
    obtenerConfiguracion(),
  ]);

  if (!venta) {
    return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
  }

  const data: ComprobanteVentaData = {
    id: venta.id,
    fecha: venta.fecha,
    clienteNombre: venta.cliente
      ? `${venta.cliente.nombre}${venta.cliente.apellido ? " " + venta.cliente.apellido : ""}`
      : null,
    items: venta.items.map((item) => ({
      nombre: item.producto?.nombre ?? item.descripcionLibre ?? "Producto",
      tipoPrecio: item.tipoPrecio,
      cantidad: item.cantidad,
      precioUnitarioARS: item.precioUnitarioUSD * venta.cotizacionUsada,
    })),
    totalARS: venta.totalARS,
    montoPagado: venta.montoPagado,
    estadoPago: venta.estadoPago,
    pagos: venta.pagos.map((p) => ({ monto: p.monto, tipoCuenta: p.cuenta.tipo })),
  };

  const buffer = await renderToBuffer(<ComprobanteVentaDocument venta={data} configuracion={configuracion} />);

  const filename = `comprobante-venta-${String(venta.id).padStart(6, "0")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}