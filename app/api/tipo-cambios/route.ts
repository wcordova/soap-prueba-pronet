import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { convertToISODate } from '@/app/utils/helper';

const prisma = new PrismaClient();

interface DateFilter {
  gte?: Date;
  lte?: Date;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  
  const fechainit = url.searchParams.get('fechainit');
  const fechafin = url.searchParams.get('fechafin');

  const dateFilter: DateFilter = {};
  if (fechainit) {
    dateFilter.gte = new Date(`${convertToISODate(fechainit)}T00:00:00`);  
  }
  
  if (fechafin) {
    dateFilter.lte = new Date(`${convertToISODate(fechafin)}T23:59:59`);  
  }

  try {
    const [totalCount, tipoCambios] = await Promise.all([
      prisma.tipoCambio.count({
        where: fechainit || fechafin ? { fecha: dateFilter } : undefined,  
      }),
      prisma.tipoCambio.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          tipo_cambio: 'desc',
        },
        where: fechainit || fechafin ? { fecha: dateFilter } : undefined,  
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      data: tipoCambios,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al obtener los datos', details: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
