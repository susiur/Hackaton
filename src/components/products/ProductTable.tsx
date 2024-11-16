import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useProductContext } from './ProductContext';

type Props = {
  onEdit: (product: any) => void;
};

export default function ProductTable({ onEdit }: Props) {
  const { products, deleteProduct } = useProductContext();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.quantity}</TableCell>
            <TableCell>${product.price}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() =>{console.log("Alo?") ;onEdit(product)}}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => useProductContext().deleteProduct(product.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
