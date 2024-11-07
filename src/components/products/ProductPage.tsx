'use client';
import { ProductProvider } from './ProductContext';
import { useState } from 'react';
import ProductTable from './ProductTable';
import ProductDialog from './ProductDialog';
export default function ProductPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  return (
    <ProductProvider>
      <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-800">Productos</h1>
          <ProductDialog
            type="add"
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={(product) => {
              // Lógica de agregar producto
            }}
          />
        </div>
        <ProductTable
          onEdit={(product) => {
            setCurrentProduct(product);
            setIsEditDialogOpen(true);
          }}
        />
        <ProductDialog
          type="edit"
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialProduct={currentProduct}
          onSubmit={(product) => {
            // Lógica de editar producto
          }}
        />
      </div>
    </ProductProvider>
  );
}
