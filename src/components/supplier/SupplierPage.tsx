'use client';

import { useState } from 'react';
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

export default function SupplierPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Supplier A', contactNumber: '123-456-789' },
    { id: 2, name: 'Supplier B', contactNumber: '987-654-321' },
    { id: 3, name: 'Supplier C' },
    { id: 4, name: 'Supplier D', contactNumber: '555-666-777' },
  ]);

  const handleAddSupplier = (newSupplier: {
    name: string;
    contactNumber?: string;
  }) => {
    const newId = suppliers.length
      ? Math.max(...suppliers.map((s) => s.id)) + 1
      : 1;
    setSuppliers((prev) => [...prev, { id: newId, ...newSupplier }]);
    setIsAddDialogOpen(false);
  };

  const handleEditSupplier = (updatedSupplier: {
    id: number;
    name: string;
    contactNumber?: string;
  }) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    );
  };

  const handleDeleteSupplier = (id: number) => {
    setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
  };

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
        <SupplierList
          suppliers={suppliers}
          onEditSupplier={handleEditSupplier}
          onDeleteSupplier={handleDeleteSupplier}
        />
      </div>
    </div>
  );
}
