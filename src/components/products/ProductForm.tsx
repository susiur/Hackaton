import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

type ProductFormProps = {
  initialProduct?: { name: string; quantity: number; price: number; minimumStockLevel: number } | null;
  onSubmit: (product: { name: string; quantity: number; price: number; minimumStockLevel: number }) => void;
  onClose: () => void;
};

export default function ProductForm({
  initialProduct,
  onSubmit,
  onClose,
}: ProductFormProps) {
  const [product, setProduct] = useState(
    initialProduct || { name: '', quantity: 0, price: 0, minimumStockLevel:0 }
  );

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [initialProduct]);

  return (
    <div>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre
          </Label>
          <Input
            id="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-right">
            Stock
          </Label>
          <Input
            id="quantity"
            type="number"
            value={product.quantity}
            onChange={(e) =>
              setProduct({ ...product, quantity: parseInt(e.target.value) })
            }
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="minimumStockLevel" className="text-right">
            Stock mínimo
          </Label>
          <Input
            id="minimumStockLevel"
            type="number"
            value={product.minimumStockLevel}
            onChange={(e) => setProduct({ ...product, minimumStockLevel: parseInt(e.target.value) })}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Precio
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: parseFloat(e.target.value) })
            }
            className="col-span-3"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={() => onSubmit(product)}>
          Guardar Producto
        </Button>
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
