'use client';
import { ProductProvider } from './ProductContext';
import { useState } from 'react';
import ProductTable from './ProductTable';
import ProductDialog from './ProductDialog';
export default function ProductPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  async function handleAddProduct(product: { name: string; quantity: number; price: number; }) {
    const response = await fetch('https://hackaton-v20o.onrender.com/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({product}),
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return await response.json();
  }
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
              handleAddProduct(product);
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
