'use client';

import { useState, useEffect } from 'react';
import { useProductContext } from '@/components/products/ProductContext';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

type ProductSelectorProps = {
  onSelectProduct: (productId: number) => void;
};

export default function ProductSelector({
  onSelectProduct,
}: ProductSelectorProps) {
  const { products } = useProductContext();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  useEffect(() => {
    if (selectedProduct !== null) {
      onSelectProduct(selectedProduct);
    }
  }, [selectedProduct, onSelectProduct]);

  return (
    <Select onValueChange={(value) => setSelectedProduct(Number(value))}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccione un producto" />
      </SelectTrigger>
      <SelectContent>
        {products.map((product) => (
          <SelectItem key={product.id} value={String(product.id)}>
            {product.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
