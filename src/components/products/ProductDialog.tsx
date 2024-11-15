import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ProductForm from './ProductForm';
import { Plus } from 'lucide-react';

type ProductDialogProps = {
  type: 'add' | 'edit';
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialProduct?: { id?: number; name: string; quantity: number; price: number; minimumStockLevel: number; userId?: string } | null;
  onSubmit: (product: {
    userId?: string; id?: number; name: string; quantity: number; price: number; minimumStockLevel: number  
}) => void;
};

export default function ProductDialog({
  type,
  isOpen,
  onOpenChange,
  initialProduct,
  onSubmit,
}: ProductDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {type === 'add' && (
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'add' ? 'Agregar Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          initialProduct={type === 'edit' ? initialProduct : undefined}
          onSubmit={(product) => {
            onSubmit(product);
            onOpenChange(false);
          }}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
