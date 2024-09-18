import { parseDate } from '@/app/utils/helper';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import * as soap from 'soap'; 

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { fechainit } = await request.json();

  if (!fechainit) {
    return NextResponse.json({ error: 'Fecha inicial es requerida' }, { status: 400 });
  }

  const SOAP_URL = process.env.SOAP_URL;

  if (!SOAP_URL) {
    return NextResponse.json({ error: 'SOAP_URL no está definida en las variables de entorno' }, { status: 500 });
  }

  try {
    console.log('SOAP URL:', SOAP_URL);

    const client = await new Promise<any>((resolve, reject) => {
      soap.createClient(SOAP_URL, (err, client) => {
        if (err) {
          console.error('Error al crear cliente SOAP:', err);
          reject(err);
        } else {
          resolve(client);
        }
      });
    });

    console.log('Client:', client);

    const [result] = await client.TipoCambioFechaInicialAsync({ fechainit });

    const tipoCambioResult = result.TipoCambioFechaInicialResult;
    const vars = tipoCambioResult.Vars.Var;

    // Guardar los datos en la base de datos
    const solicitud = await prisma.solicitud.create({
      data: {},
    });

    const tipoCambios = vars.map((item: any) => {
      const fecha = parseDate(item.fecha);
      if (isNaN(fecha.getTime())) {
        console.error(`Fecha inválida: ${item.fecha}`);
        return null; 
      }

      return {
        fecha: fecha,
        tc_venta: parseFloat(item.venta),
        tc_compra: parseFloat(item.compra),
        moneda: parseInt(item.moneda, 10),
        no_solicitud: solicitud.solicitud,
      };
    }).filter((item: null) => item !== null);

    await prisma.tipoCambio.createMany({
      data: tipoCambios,
    });

    return NextResponse.json({ data: vars });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al consumir el servicio SOAP', details: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
