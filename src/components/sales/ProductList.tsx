
import { ProductSale } from "@/services/productSalesService";
import ProductSaleItem from "./ProductSaleItem";

interface ProductListProps {
  products: ProductSale[];
  isLoading: boolean;
}

const ProductList = ({ products, isLoading }: ProductListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {products.map((product, index) => (
        <ProductSaleItem key={index} {...product} />
      ))}
    </div>
  );
};

export default ProductList;
