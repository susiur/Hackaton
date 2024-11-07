import { createContext, useContext, useState, ReactNode } from 'react';

type Product = {
  id: number;
  name: string;
  stock: number;
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
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Arroz', stock: 100, price: 2.5 },
    { id: 2, name: 'Frijoles', stock: 80, price: 1.8 },
    { id: 3, name: 'Aceite', stock: 50, price: 3.2 },
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