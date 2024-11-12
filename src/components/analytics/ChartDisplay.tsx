'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import * as dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// Mock data extendido para diferentes productos con más variación y agrupado por fechas
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

type ChartDisplayProps = {
  productId: number | null;
  timeFilter: 'day' | 'month' | 'year'
  predictedData: any[];
};

export default function ChartDisplay({
  productId,
  timeFilter,
  predictedData
}: ChartDisplayProps) {
  const [filteredData, setFilteredData] = useState<typeof predictedData>([]);

  useEffect(() => {
    if (productId !== null) {
      const filtered = predictedData.filter((data) => data.productId === productId);

      // Agrupar datos según el filtro de tiempo
      let groupedData = filtered;
      if (timeFilter === 'month') {
        groupedData = filtered.reduce(
          (acc, item) => {
            const month = dayjs(item.date).format('YYYY-MM');
            acc[month] = (acc[month] || 0) + item.quantity;
            return acc;
          },
          {} as Record<string, number>
        );
      } else if (timeFilter === 'year') {
        groupedData = filtered.reduce(
          (acc, item) => {
            const year = dayjs(item.date).format('YYYY');
            acc[year] = (acc[year] || 0) + item.quantity;
            return acc;
          },
          {} as Record<string, number>
        );
      } else if (timeFilter === 'day') {
        groupedData = filtered.reduce(
          (acc, item) => {
            acc[item.date] = item.quantity;
            return acc;
          },
          {} as Record<string, number>
        );
      }

      setFilteredData(groupedData);
    }
  }, [productId, timeFilter]);

  const chartData = {
    labels: Object.keys(filteredData),
    datasets: [
      {
        label: 'Cantidad vendida',
        data: Object.values(filteredData),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div>
      {productId ? (
        <Line data={chartData} />
      ) : (
        <p>Seleccione un producto para ver el gráfico.</p>
      )}
    </div>
  );
}
