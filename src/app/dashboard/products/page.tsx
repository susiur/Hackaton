import DashboardLayout from '@/components/dashboard/DashboardLayout';

import ProductPage from '@/components/products/ProductPage';

export default function Page() {
  return (
    <DashboardLayout>
      <ProductPage />
    </DashboardLayout>
  );
}
