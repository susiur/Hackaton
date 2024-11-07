'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type SupplierFormProps = {
  initialSupplier?: { id?: number; name: string; contactNumber?: string };
  onSubmit: (supplier: {
    id?: number;
    name: string;
    contactNumber?: string;
  }) => void;
  onClose: () => void;
};

export default function SupplierForm({
  initialSupplier,
  onSubmit,
  onClose,
}: SupplierFormProps) {
  const [supplier, setSupplier] = useState(
    initialSupplier || { name: '', contactNumber: '' }
  );

  return (
    <div>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre
          </Label>
          <Input
            id="name"
            value={supplier.name}
            onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="contactNumber" className="text-right">
            Número de Contacto
          </Label>
          <Input
            id="contactNumber"
            value={supplier.contactNumber}
            onChange={(e) =>
              setSupplier({ ...supplier, contactNumber: e.target.value })
            }
            className="col-span-3"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={() => onSubmit(supplier)}>
          Guardar Proveedor
        </Button>
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
