import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const tipoCambios = await prisma.tipoCambio.findMany({
      orderBy: {
        tipo_cambio: 'desc',
      },
    });

    return NextResponse.json({ data: tipoCambios });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al obtener los datos', details: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
