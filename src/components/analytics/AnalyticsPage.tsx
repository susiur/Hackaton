// AnalyticsPage.tsx
'use client';

import { useState } from 'react';
import ProductSelector from './ProductSelector';
import ChartDisplay from './ChartDisplay';
import { ProductProvider } from '../products/ProductContext';
import * as XLSX from 'xlsx';

export default function AnalyticsPage() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [timeFilter, setTimeFilter] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  const [predictionComplete, setPredictionComplete] = useState(false);

  const handlePredictClick = async () => {
    setLoading(true);
    setPredictionComplete(false);
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Esperar 10 segundos
    setLoading(false);
    setPredictionComplete(true);
    downloadMockExcel();
  };

  const downloadMockExcel = () => {
    const data = [
      ['Fecha', 'Cantidad Predicha'],
      ['2023-11-01', 10],
      ['2023-11-02', 15],
      ['2023-11-03', 20],
      // Añadir más datos mockeados según sea necesario
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Predicción');
    XLSX.writeFile(workbook, 'prediccion_demanda.xlsx');
  };

  return (
    <ProductProvider>
      <div className="w-full h-full min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="w-full max-w-4xl">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-blue-800">
              Analytics de Productos
            </h1>
          </div>
          <div className="mb-4">
            <ProductSelector
              onSelectProduct={(productId) => setSelectedProductId(productId)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtro de tiempo:
            </label>
            <select
              value={timeFilter}
              onChange={(e) =>
                setTimeFilter(e.target.value as 'month' | 'year')
              }
              className="border rounded px-2 py-1"
            >
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
            </select>
          </div>
          <ChartDisplay productId={selectedProductId} timeFilter={timeFilter} />
          <div className="mt-4">
            <button
              onClick={handlePredictClick}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Predecir demanda para los próximos 30 días
            </button>
          </div>
          {loading && (
            <div className="mt-4 text-blue-800">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                role="status"
              >
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p>Prediciendo información...</p>
            </div>
          )}
          {predictionComplete && (
            <div className="mt-4 text-green-800">
              <p>Predicción completada. El archivo Excel se ha descargado.</p>
            </div>
          )}
        </div>
      </div>
    </ProductProvider>
  );
}
