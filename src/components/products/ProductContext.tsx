import { useAuth } from '@/context/AuthContext';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Product = {
  id: number;
  userId?: string;
  name: string;
  quantity: number;
  minimumStockLevel: number;
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
    { id: 1, name: 'Arroz', quantity: 100, price: 2.5, minimumStockLevel: 10 },
    { id: 2, name: 'Frijoles', quantity: 80, price: 1.8 , minimumStockLevel: 10},
    { id: 3, name: 'Aceite', quantity: 50, price: 3.2 , minimumStockLevel: 10},
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
  const fetchProducts = async () => {
    try {
      const response = await fetch(`https://hackaton-v20o.onrender.com/productos?userId=${userId}`);
      if (!response.ok) throw new Error('Error al obtener productos');
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [userId]);

  return (
    <div>
      <button onClick={fetchProducts} className="text-gray-500">
        <FontAwesomeIcon icon={faSyncAlt} size="lg" />
      </button>
    <ProductContext.Provider
      value={{ products, addProduct, editProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
    </div>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};