'use client';

import SupplierCard from './SupplierCard';
import { useState } from 'react';
import SupplierForm from './SupplierForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Supplier = {
  id: number;
  name: string;
  contactNumber?: string;
};

type SupplierListProps = {
  suppliers: Supplier[];
  onEditSupplier: (updatedSupplier: Supplier) => void;
  onDeleteSupplier: (id: number) => void;
};

export default function SupplierList({
  suppliers,
  onEditSupplier,
  onDeleteSupplier,
}: SupplierListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);

  const handleEdit = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleSubmitEdit = (updatedSupplier: Supplier) => {
    onEditSupplier(updatedSupplier);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            name={supplier.name}
            contactNumber={supplier.contactNumber}
            onEdit={() => handleEdit(supplier)}
            onDelete={() => onDeleteSupplier(supplier.id)}
          />
        ))}
      </div>

      {currentSupplier && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Proveedor</DialogTitle>
            </DialogHeader>
            <SupplierForm
              initialSupplier={currentSupplier}
              onSubmit={handleSubmitEdit}
              onClose={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
