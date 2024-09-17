import soap from 'soap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOAP_URL = process.env.SOAP_URL;

async function fetchAndSaveTipoCambio(fechainit: string) {
  if (!SOAP_URL) {
    throw new Error('SOAP_URL no está definida en las variables de entorno.');
  }

  const client = await soap.createClientAsync(SOAP_URL);

  const [result] = await client.TipoCambioFechaInicialAsync({
    fechainit,
  });

  const tipoCambioResult = result.TipoCambioFechaInicialResult;
  const vars = tipoCambioResult.Vars.Var;

  for (const item of vars) {
    await prisma.tipoCambios.create({
      data: {
        fecha: new Date(item.fecha), 
        tc_venta: item.venta,
        tc_compra: item.compra,
      },
    });
  }
}

fetchAndSaveTipoCambio('2024-09-01').catch(console.error);
