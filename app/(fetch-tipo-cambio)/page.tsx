"use client";
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  TablePagination,
  Typography,
} from '@mui/material';
import { formatDate } from '../utils/helper';

interface TipoCambio {
  fecha: string;
  tc_venta: number;
  tc_compra: number;
  moneda: string;
  no_solicitud: string;
}

interface FetchResponse {
  data: TipoCambio[];
  totalPages: number;
  currentPage: number;
}

export default function Page() {
  const [fecha, setFecha] = useState<string>('');
  const [fechainit, setFechainit] = useState<string>(''); 
  const [fechafin, setFechafin] = useState<string>(''); 
  const [tipoCambios, setTipoCambios] = useState<TipoCambio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTipoCambios = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tipo-cambios?page=${page + 1}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data: FetchResponse = await response.json();
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
      const data: FetchResponse = await response.json();
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

  const fetchTipoCambioByDate = async () => {
    if (!fecha) return; 

    setLoading(true);
    try {
      const formattedFecha = formatDate(fecha);
      const response = await fetch('/api/fetch-tipo-cambio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fechainit: formattedFecha }),
      });
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      await response.json(); // Adjust this based on actual response
      setTipoCambios([]);
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

  const calcularPromedio = (tipo: keyof TipoCambio) => {
    if (tipoCambios.length === 0) return 0;
    const suma = tipoCambios.reduce((acc, item) => {
      const valor = parseFloat(item[tipo].toString()); 
      return !isNaN(valor) ? acc + valor : acc;
    }, 0);
    return (suma / tipoCambios.length).toFixed(2);
  };
  

  const promedioVenta = tipoCambios.length > 0 ? calcularPromedio('tc_venta') : 0;
  const promedioCompra = tipoCambios.length > 0 ? calcularPromedio('tc_compra') : 0;

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
            onClick={fetchTipoCambioByDate}
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
            {tipoCambios.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{item.tc_venta}</TableCell>
                <TableCell>{item.tc_compra}</TableCell>
                <TableCell>{item.moneda}</TableCell>
                <TableCell>{item.no_solicitud}</TableCell>
              </TableRow>
            ))}
            {tipoCambios.length > 0 && (
              <TableRow>
                <TableCell><strong>Promedio</strong></TableCell>
                <TableCell><strong>{promedioVenta}</strong></TableCell>
                <TableCell><strong>{promedioCompra}</strong></TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            )}
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
