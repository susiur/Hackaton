'use client';

import { useState, useEffect } from 'react';
import SupplierList from './SupplierList';
import SupplierForm from './SupplierForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SupplierPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { userId } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener proveedores
  useEffect(() => {
    if (!userId) return;

    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://hackaton-v20o.onrender.com/providers?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Error al obtener proveedores');
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [userId]);

  // Crear proveedor
  const handleAddSupplier = async (newSupplier: any) => {
    try {
      const response = await fetch(`https://hackaton-v20o.onrender.com/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...newSupplier }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el proveedor');
      }

      const data = await response.json();
      setSuppliers((prev) => [...prev, { id: data.id, ...newSupplier }]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  // Eliminar proveedor
  const handleDeleteSupplier = async (id: any) => {
    try {
      const response = await fetch(`https://hackaton-v20o.onrender.com/providers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el proveedor');
      }

      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  if (!userId) {
    return <div>No estás autenticado.</div>;
  }

  return (
    <div className="w-full h-full min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-800">
            Administrar Proveedores
          </h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Agregar Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <SupplierForm
                onSubmit={handleAddSupplier}
                onClose={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Cargando proveedores...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <SupplierList
            suppliers={suppliers}
            onEditSupplier={handleAddSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        )}
      </div>
    </div>
  );
}
