'use client'; 

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const DashboardClient = ({ userId }: { userId: string | null}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalVentas, setTotalVentas] = useState(0);
  const [ventasUltimoMes, setVentasUltimoMes] = useState(0);
  const [productosVendidos, setProductosVendidos] = useState(0);
  const [productosAyer, setProductosAyer] = useState(0);
  const [promedioTransaccionesDiarias, setPromedioTransaccionesDiarias] = useState(0);
  const [transaccionesAyer, setTransaccionesAyer] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://ec75-201-184-144-194.ngrok-free.app/compras?userId=${userId}`);
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

        // Calcular total de productos vendidos
        const totalProductos = data.reduce((acc: any, transaction: { productos: any[]; }) => {
          const transactionTotal = transaction.productos.reduce((sum: number, product: { quantity: number; }) => sum + product.quantity, 0);
          return acc + transactionTotal;
        }, 0);
        setProductosVendidos(totalProductos);
        // Calcular productos vendidos de ayer
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const productosAyer = data.reduce((acc: any, transaction: { date: string | number | Date; productos: any[]; }) => {
          const transactionDate = new Date(transaction.date);
          if (transactionDate >= yesterday) {
            const transactionTotal = transaction.productos.reduce((sum: number, product: { quantity: number; }) => sum + product.quantity, 0);
            return acc + transactionTotal;
          }
          return acc;
        }, 0);
        setProductosAyer(productosAyer);

        // Calcular promedio de transacciones diarias
        const transaccionesDiarias = data.reduce((acc: any, transaction: { date: string | number | Date; }) => {
          const transactionDate = new Date(transaction.date);
          if (transactionDate >= yesterday) {
            return acc + 1;
          }
          return acc;
        }, 0);
        setPromedioTransaccionesDiarias(transaccionesDiarias / 30);

        // Calcular transacciones de ayer
        const transaccionesAyer = data.reduce((acc: any, transaction: { date: string | number | Date; }) => {
          const transactionDate = new Date(transaction.date);
          if (transactionDate >= yesterday) {
            return acc + 1;
          }
          return acc;
        }, 0);
        setTransaccionesAyer(transaccionesAyer);
      } catch (error) {
        console.error('Error fetching compras:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);
  
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ventas Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div>
                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
                    <div>
                        <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
                        <p className="text-xs text-blue-600">+{(ventasUltimoMes/totalVentas*100).toFixed(2)}% del mes pasado</p>
                    </div>
                )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Productos Vendidos
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div>
                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
                    <div>
                        <div className="text-2xl font-bold">+{productosVendidos}</div>
                        <p className="text-xs text-blue-600">+{productosAyer} de ayer</p>
                    </div>
                )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Transacciones Diarias
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div>
                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
                    <div>
                    <div className="text-2xl font-bold">{promedioTransaccionesDiarias.toFixed(2)}</div>
                    <p className="text-xs text-blue-600">+{transaccionesAyer} de ayer</p>
                    </div>
                )}
                </div>
              </CardContent>
            </Card>
        </div>
  );
};

export default DashboardClient;

