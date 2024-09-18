import { parseDate } from '@/app/utils/helper';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import * as soap from 'soap';

const prisma = new PrismaClient();

interface TipoCambioResponse {
  TipoCambioFechaInicialResult: {
    Vars: {
      Var: TipoCambioItem[];
    };
  };
}

interface TipoCambioItem {
  fecha: string;
  venta: string;
  compra: string;
  moneda: string;
}

interface TipoCambioData {
  fecha: Date;
  tc_venta: number;
  tc_compra: number;
  moneda: number;
  no_solicitud: number; 
}

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

    const client = await new Promise<soap.Client>((resolve, reject) => {
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

    const tipoCambioResult: TipoCambioResponse = result;
    const vars = tipoCambioResult.TipoCambioFechaInicialResult.Vars.Var;

    const solicitud = await prisma.solicitud.create({
      data: {},
    });

    // Mapea los datos y filtra los nulos
    const tipoCambios: TipoCambioData[] = vars
      .map((item) => {
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
        } as TipoCambioData; 
      })
      .filter((item): item is TipoCambioData => item !== null); 

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
