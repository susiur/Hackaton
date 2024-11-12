'use client'; 

import { useEffect, useState } from 'react';

const DashboardClient = ({ userId }: { userId: string | null}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalVentas, setTotalVentas] = useState(0);
  const [ventasUltimoMes, setVentasUltimoMes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/compras?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Error al obtener compras');
        }
        const data = await response.json();
        console.log(data);
        // Calcular total de todas las compras
        const totalCompras = data.reduce((acc: any, transaction: { productos: any[]; }) => {
          const transactionTotal = transaction.productos.reduce((sum: number, product: { price: string; quantity: number; }) => sum + parseFloat(product.price) * product.quantity, 0);
          return acc + transactionTotal;
        }, 0);

        setTotalVentas(totalCompras);

        // Calcular total de las compras del último mes
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const totalUltimoMes = data.reduce((acc: any, transaction: { date: string | number | Date; productos: any[]; }) => {
          const transactionDate = new Date(transaction.date);
          if (transactionDate >= oneMonthAgo) {
            const transactionTotal = transaction.productos.reduce((sum: number, product: { price: string; quantity: number; }) => sum + parseFloat(product.price) * product.quantity, 0);
            return acc + transactionTotal;
          }
          return acc;
        }, 0);

        setVentasUltimoMes(totalUltimoMes);

      } catch (error) {
        console.error('Error fetching compras:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);
  
    return (
    <div>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div>
            <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
            <p className="text-xs text-blue-600">+{ventasUltimoMes/totalVentas*100}% del mes pasado</p>
        </div>
      )}
    </div>
  );
};

export default DashboardClient;

