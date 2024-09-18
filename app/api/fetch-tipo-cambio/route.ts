import { NextResponse } from 'next/server';
import * as soap from 'soap'; // O usa 'import soap from 'soap';' si prefieres

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

    // Crear cliente SOAP
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

    // Llamar al método del servicio SOAP
    const [result] = await client.TipoCambioFechaInicialAsync({ fechainit });

    // Procesar la respuesta SOAP
    const tipoCambioResult = result.TipoCambioFechaInicialResult;
    const vars = tipoCambioResult.Vars.Var;

    // Devuelve la respuesta SOAP como JSON
    return NextResponse.json({ data: vars });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al consumir el servicio SOAP', details: errorMessage }, { status: 500 });
  }
}
