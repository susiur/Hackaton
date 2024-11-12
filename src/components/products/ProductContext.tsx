import { useAuth } from '@/context/AuthContext';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Product = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type ProductContextType = {
  products: Product[];
  addProduct: (product: Product) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Arroz', quantity: 100, price: 2.5 },
    { id: 2, name: 'Frijoles', quantity: 80, price: 1.8 },
    { id: 3, name: 'Aceite', quantity: 50, price: 3.2 },
  ]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now() }]);
  };

  const editProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  useEffect(() => {
    if (!userId) return;
    
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/productos?userId=${userId}`);
        if (!response.ok) throw new Error('Error al obtener productos');
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [userId]);

  return (
    <ProductContext.Provider
      value={{ products, addProduct, editProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};