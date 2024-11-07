'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SupplierCardProps = {
  name: string;
  contactNumber?: string;
  onEdit: () => void;
  onDelete: () => void;
};

export default function SupplierCard({
  name,
  contactNumber,
  onEdit,
  onDelete,
}: SupplierCardProps) {
  return (
    <Card className="w-full max-w-xs bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2 bg-gray-200 p-2 rounded-full">
            <Edit className="h-5 w-5 text-indigo-500" />
          </span>
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">
          Contacto: {contactNumber || 'No disponible'}
        </p>
        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
