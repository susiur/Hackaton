'use client';
import { ProductProvider } from './ProductContext';
import { useState } from 'react';
import ProductTable from './ProductTable';
import ProductDialog from './ProductDialog';
import { useAuth } from '@/context/AuthContext';
export default function ProductPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { userId } = useAuth();

  async function handleAddProduct(product: { name: string; quantity: number; price: number, minimumStockLevel: number; userId?: string }) {
    if (userId) {
      product.userId = userId;
    }
    console.log(product);
    const response = await fetch('https://ec75-201-184-144-194.ngrok-free.app/productos', {
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

  async function handleEditProduct(product: { id: number; name: string; quantity: number; price: number, minimumStockLevel: number; userId?: string }) {
    console.log(product);
    if (userId) {
      product.userId = userId;
    }
    console.log(product);
    const response = await fetch(`https://ec75-201-184-144-194.ngrok-free.app/productos/${product.id}`, {
      method: 'PUT',
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
            // if the product id is null, do nothing
            if (!product.id || !product.userId) return;
            let product_re = {
              id: product.id,
              name: product.name,
              quantity: product.quantity,
              price: product.price,
              minimumStockLevel: product.minimumStockLevel,
              userId: product.userId
            }
            handleEditProduct(product_re);
          }}
        />
      </div>
    </ProductProvider>
  );
}
