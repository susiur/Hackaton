'use client';

import { useEffect, useState } from 'react';
import ProductSelector from './ProductSelector';
import ChartDisplay from './ChartDisplay';
import { ProductProvider } from '../products/ProductContext';
import * as XLSX from 'xlsx';
import { getPredictionData } from './ServerAPIHandler';
import { useAuth } from '@/context/AuthContext';
const mockData = [
  // Producto 1 - Ventas de arroz
  { productId: 1, date: '2023-01-05', quantity: 10 },
  { productId: 1, date: '2023-01-15', quantity: 15 },
  { productId: 1, date: '2023-02-03', quantity: 20 },
  { productId: 1, date: '2023-02-10', quantity: 25 },
  { productId: 1, date: '2023-03-01', quantity: 18 },
  { productId: 1, date: '2023-03-12', quantity: 22 },
  { productId: 1, date: '2023-04-07', quantity: 30 },
  { productId: 1, date: '2023-05-15', quantity: 5 },
  { productId: 1, date: '2023-06-10', quantity: 12 },
  { productId: 1, date: '2023-07-21', quantity: 8 },
  { productId: 1, date: '2023-08-05', quantity: 17 },
  { productId: 1, date: '2023-09-12', quantity: 14 },
  { productId: 1, date: '2023-10-02', quantity: 10 },

  // Producto 2 - Ventas de frijoles
  { productId: 2, date: '2023-01-10', quantity: 5 },
  { productId: 2, date: '2023-01-20', quantity: 12 },
  { productId: 2, date: '2023-02-15', quantity: 14 },
  { productId: 2, date: '2023-03-05', quantity: 20 },
  { productId: 2, date: '2023-03-22', quantity: 8 },
  { productId: 2, date: '2023-04-01', quantity: 19 },
  { productId: 2, date: '2023-05-11', quantity: 15 },
  { productId: 2, date: '2023-06-20', quantity: 25 },
  { productId: 2, date: '2023-07-03', quantity: 10 },
  { productId: 2, date: '2023-08-18', quantity: 30 },
  { productId: 2, date: '2023-09-25', quantity: 22 },
  { productId: 2, date: '2023-10-14', quantity: 28 },

  // Producto 3 - Ventas de aceite
  { productId: 3, date: '2023-01-08', quantity: 8 },
  { productId: 3, date: '2023-02-02', quantity: 18 },
  { productId: 3, date: '2023-02-20', quantity: 24 },
  { productId: 3, date: '2023-03-10', quantity: 5 },
  { productId: 3, date: '2023-03-28', quantity: 12 },
  { productId: 3, date: '2023-04-15', quantity: 20 },
  { productId: 3, date: '2023-05-06', quantity: 9 },
  { productId: 3, date: '2023-06-12', quantity: 15 },
  { productId: 3, date: '2023-07-30', quantity: 21 },
  { productId: 3, date: '2023-08-08', quantity: 16 },
  { productId: 3, date: '2023-09-15', quantity: 18 },
  { productId: 3, date: '2023-10-03', quantity: 14 },
];

export default function AnalyticsPage() {
  const { userId } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'day'>('month');
  const [loading, setLoading] = useState(false);
  const [predictionComplete, setPredictionComplete] = useState(false);
  const [predictedData, setPredictedData] = useState<any[]>(mockData);

  useEffect(() => {
    // Obtener la fecha de hoy
    const today = new Date();
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(today.getMonth() + 1);

    // Formatear las fechas en formato 'YYYY-MM-DD'
    const formattedStartDate = today.toISOString().split('T')[0];
    const formattedEndDate = monthFromNow.toISOString().split('T')[0];

    // Establecer las fechas en el estado
    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
  }, []); 

  const handlePredictClick = async () => {
    setLoading(true);
    setPredictionComplete(false);
    try {
      const data = await getPredictionData(
        userId,
        startDate,
        endDate
      );
      const predictionData = data.prediccionPorDia;
      const predictedData = predictionData.map(({ year,month,day, prediction, product_id }: { year: number, month: number, day: number, prediction: number, product_id: number}) => {
        //para meses y dias de un solo digito, agregar 0 al inicio
        const formattedMonth = month < 10 ? `0${month}` : month;
        const formattedDay = day < 10 ? `0${day}` : day
        const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

        //redondear hacia arriba prediction
        prediction = Math.ceil(prediction);

        return {
          productId: product_id,
          date: formattedDate,
          quantity: prediction,
        };
      });
      setPredictedData(predictedData); // Actualizar predictedData
      setLoading(false);
      setPredictionComplete(true);
      //print predictedData
      console.log(predictedData);
      // downloadMockExcel(predictedData);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setLoading(false);
      throw error;
    }
  };

  const downloadMockExcel = (predictedData: any[]) => {
    const worksheet = XLSX.utils.aoa_to_sheet(predictedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Predicción');
    XLSX.writeFile(workbook, 'prediccion_demanda.xlsx');
  };

  return (
    <ProductProvider>
      <div className="w-full h-full min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="w-full max-w-4xl">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-blue-800">Predicción de demanda de Productos</h1>
            <p>Para predecir la demanda a futuro en fechas específicas ingrese las fechas a contiinuación. Por default se predice el siguiente mes</p>
          </div>
          <div className="mt-4 flex space-x-4">
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 p-2 rounded bg-transparent"
            />
          </div>

          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700">Fecha de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 p-2 rounded bg-transparent"
            />
          </div>
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
                setTimeFilter(e.target.value as 'month' | 'year' | 'day')
              }
              className="border rounded px-2 py-1"
            >
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
              <option value="day">Diario</option>
            </select>
          </div>
          <ChartDisplay
            productId={selectedProductId}
            timeFilter={timeFilter}
            predictedData={predictedData}
          />
          <div className="flex justify-center">
            <button
              onClick={handlePredictClick}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              {loading ? 'Cargando...' : 'Predecir demanda de tiempo seleccionado'}
            </button>
          </div>
          {predictionComplete && (
            <div className="mt-4 text-green-500">Predicción completada exitosamente.</div>
          )}
        </div>
      </div>
    </ProductProvider>
  );
}
