"use client";
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, TablePagination, Typography } from '@mui/material';
import { formatDate } from '../utils/helper';

export default function Page() {
  const [fecha, setFecha] = useState('');
  const [fechainit, setFechainit] = useState(''); // Nueva fecha de inicio
  const [fechafin, setFechafin] = useState(''); // Nueva fecha de fin
  const [tipoCambios, setTipoCambios] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchTipoCambios = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tipo-cambios?page=${page + 1}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setTipoCambios(data.data || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage - 1 || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTipoCambios([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar por rango de fechas (fecha inicio y fecha fin)
  const fetchTipoCambioByDateRange = async () => {
    if (!fechainit || !fechafin) return;

    setLoading(true);
    try {
      const formattedFechainit = formatDate(fechainit);
      const formattedFechafin = formatDate(fechafin);
      const response = await fetch(`/api/tipo-cambios?fechainit=${formattedFechainit}&fechafin=${formattedFechafin}`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setTipoCambios(data.data || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTipoCambios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipoCambios(currentPage);
  }, [currentPage]);

  return (
    <div className="p-4">
      <Typography variant="h4" component="h1" gutterBottom>
        Consultar Tipo de Cambio
      </Typography>

      <div className="mb-4">
        <div className="flex gap-4 items-center mb-4">
          <TextField
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            fullWidth
            helperText="Seleccione una fecha específica"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchTipoCambioByDateRange}
            disabled={loading || !fecha}
            sx={{ mb: 2 }}
          >
            Enviar solicitud
          </Button>
        </div>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => fetchTipoCambios(0)}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Buscar Todos
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex gap-4 items-center mb-4">
          <div>
          <TextField
            type="date"
            label="Fecha Inicio"
            value={fechainit}
            onChange={(e) => setFechainit(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
          </div>
          <div>
          <TextField
            type="date"
            label="Fecha Fin"
            value={fechafin}
            onChange={(e) => setFechafin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
          </div>
          
          <Button
            variant="contained"
            color="primary"
            onClick={fetchTipoCambioByDateRange}
            disabled={loading || !fechainit || !fechafin}
            sx={{ mb: 2 }}
          >
            Buscar por Rango de Fechas
          </Button>
        </div>
      </div>

      {error && <Typography color="error">{error}</Typography>}

      <TableContainer component={Paper} className="mt-4">
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

      <TablePagination
        component="div"
        count={totalPages * pageSize}
        page={currentPage}
        onPageChange={(event, newPage) => setCurrentPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={() => {}}
        rowsPerPageOptions={[]}
      />
    </div>
  );
}
