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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useProductContext } from './ProductContext';

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
        <div className="flex items-center space-x-4">
        <Button
        onClick={useProductContext().refreshProducts}
        className="text-gray-500 hover:text-gray-700 bg-transparent"
      >
        <FontAwesomeIcon icon={faSyncAlt} size="lg" />
      </Button>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
        </DialogTrigger>
        </div>
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
