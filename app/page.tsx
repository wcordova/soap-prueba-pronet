'use client';

import { useState } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Button, TextField, Typography } from '@mui/material';

export default function Page() {
  const [fecha, setFecha] = useState('');
  const [tipoCambios, setTipoCambios] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTipoCambios = async () => {
    try {
      const response = await fetch(`/api/tipo-cambios`);
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
    <div className="p-6 max-w-4xl mx-auto">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Consultar Tipo de Cambio
      </Typography>

      <div className="flex justify-center mb-6 gap-4">
        <TextField
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button
          onClick={fetchTipoCambios}
          variant="contained"
          color="primary"
        >
          Buscar
        </Button>
      </div>

      {error && (
        <Typography color="error" align="center" gutterBottom>
          {error}
        </Typography>
      )}

      {tipoCambios.length > 0 && (
        <TableContainer component={Paper} className="max-w-full">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>TC Venta</TableCell>
                <TableCell>TC Compra</TableCell>
                <TableCell>Moneda</TableCell>
                <TableCell>No Solicitud</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tipoCambios.map((item) => (
                <TableRow key={item.tipo_cambio}>
                  <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{item.tc_venta}</TableCell>
                  <TableCell>{item.tc_compra}</TableCell>
                  <TableCell>{item.moneda}</TableCell>
                  <TableCell>{item.no_solicitud}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
