import { Pencil, Trash2, Gift, Store, Heart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    expiration_date?: string;
    image_url: string;
    days_until_expiry?: number;
    suggested_actions: string[];
    reason: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSurpriseBag: (id: string) => void;
  onMarketplace: (id: string) => void;
  onDonation: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete, onSurpriseBag, onMarketplace, onDonation }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative mb-3">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-32 object-cover rounded-md"
        />
        <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
          Stock: {product.stock}
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-1">{product.category}</p>
        <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
        
        {product.expiration_date && (
          <p className="text-xs text-gray-500 mt-1">
            ⏰ {product.reason}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>

        {product.suggested_actions.includes("surprise_bag") && (
          <button
            onClick={() => onSurpriseBag(product.id)}
            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
          >
            <Gift className="w-3 h-3" />
            Surprise Bag
          </button>
        )}

        {product.suggested_actions.includes("marketplace") && (
          <button
            onClick={() => onMarketplace(product.id)}
            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
          >
            <Store className="w-3 h-3" />
            Marketplace
          </button>
        )}

        {product.suggested_actions.includes("donation") && (
          <button
            onClick={() => onDonation(product.id)}
            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-pink-700 bg-pink-50 hover:bg-pink-100 rounded transition-colors"
          >
            <Heart className="w-3 h-3" />
            Donation
          </button>
        )}
      </div>
    </div>
  );
}
