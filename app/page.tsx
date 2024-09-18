"use client"

import { useState } from 'react';

export default function Page() {
  const [fecha, setFecha] = useState('');
  const [tipoCambios, setTipoCambios] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTipoCambios = async () => {
    try {
      const response = await fetch(`/api/tipo-cambios?fecha=${encodeURIComponent(fecha)}`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setTipoCambios(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTipoCambios([]);
    }
  };

  return (
    <div>
      <h1>Consultar Tipo de Cambio</h1>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />
      <button onClick={fetchTipoCambios}>Buscar</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {tipoCambios.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>TC Venta</th>
              <th>TC Compra</th>
              <th>Moneda</th>
              <th>No Solicitud</th>
            </tr>
          </thead>
          <tbody>
            {tipoCambios.map((item) => (
              <tr key={item.tipo_cambio}>
                <td>{new Date(item.fecha).toLocaleDateString()}</td>
                <td>{item.tc_venta}</td>
                <td>{item.tc_compra}</td>
                <td>{item.moneda}</td>
                <td>{item.no_solicitud}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
