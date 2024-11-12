import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart2,
  DollarSign,
  Link,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import DashboardClient from './DashboardClient'; 
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();
  const actions = [
    {
      title: 'Administrar productos y su stock',
      icon: Package,
      href: '/dashboard/products',
    },
    {
      title: 'Analítica de productos',
      icon: BarChart2,
      href: '/dashboard/analytics',
    },
    {
      title: 'Administrar proveedores',
      icon: Truck,
      href: '/dashboard/suppliers',
    },
  ];
  return (
    <DashboardLayout>
      <div className="flex h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-blue-800">
              Bienvenido a Tenderos Crediticos
            </h1>
            <p className="text-blue-600">Gestiona tu tienda con facilidad</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ventas Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <DashboardClient userId={session?.user?.id ?? null} /> {/* Usamos el componente cliente */}
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
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-blue-600">+180 de ayer</p>
              </CardContent>
            </Card>
            <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clientes Activos
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-blue-600">+201 nuevos esta semana</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actions.map((action) => (
              <Card
                key={action.title}
                className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {action.title}
                  </CardTitle>
                  <Link href={action.href} className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <action.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105">
              Ver Todos los Reportes
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
