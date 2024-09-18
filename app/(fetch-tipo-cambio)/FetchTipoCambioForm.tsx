// components/FetchTipoCambioForm.tsx
import React, { useState } from 'react';

const FetchTipoCambioForm: React.FC = () => {
  const [fecha, setFecha] = useState<string>('');
  const [tipoCambio, setTipoCambio] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value);
  };

  const handleFetchTipoCambio = async () => {
    if (!fecha) {
      alert('Por favor, selecciona una fecha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fetch-tipo-cambio?fecha=${encodeURIComponent(fecha)}`);
      if (!response.ok) {
        throw new Error('Error al obtener el tipo de cambio.');
      }
      const data = await response.json();
      setTipoCambio(data.tipoCambio); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Consultar Tipo de Cambio</h2>
      <input 
        type="date" 
        value={fecha} 
        onChange={handleFechaChange} 
      />
      <button 
        onClick={handleFetchTipoCambio} 
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Obtener Tipo de Cambio'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tipoCambio && <p>Tipo de Cambio: {tipoCambio}</p>}
    </div>
  );
};

export default FetchTipoCambioForm;
