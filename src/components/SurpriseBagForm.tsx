import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { SurpriseBag, Product } from "@/types/product.types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Clock, DollarSign, Package } from "lucide-react";

interface SurpriseBagFormProps {
  onSuccess?: () => void;
}

interface SurpriseBagFormData {
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  quantity: number;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  expirationDate: string;
}

export const SurpriseBagForm = ({ onSuccess }: SurpriseBagFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contents, setContents] = useState<string[]>([]);
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<SurpriseBagFormData>();

  const watchedPrice = watch("price");
  const watchedOriginalPrice = watch("originalPrice");
  const discount = watchedOriginalPrice && watchedPrice 
    ? Math.round(((watchedOriginalPrice - watchedPrice) / watchedOriginalPrice) * 100)
    : 0;

  const addContent = () => {
    if (newContent.trim() && !contents.includes(newContent.trim())) {
      setContents([...contents, newContent.trim()]);
      setNewContent("");
    }
  };

  const removeContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SurpriseBagFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a surprise bag",
        variant: "destructive"
      });
      return;
    }

    if (contents.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the surprise bag contents",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const surpriseBag: Omit<SurpriseBag, 'id'> = {
        ...data,
        contents,
        category: "Surprise Bag",
        userId: user.id,
        image: "/lovable-uploads/surprise-bag-placeholder.png", // Default image
        isMarketplaceVisible: true
      };

      // Convert to Product type for the service
      const productData: Omit<Product, 'id'> = {
        name: data.name,
        price: data.price,
        description: data.description,
        category: "Surprise Bag",
        brand: "WiseBite",
        quantity: data.quantity,
        expirationDate: data.expirationDate,
        image: "/lovable-uploads/surprise-bag-placeholder.png",
        userId: user.id,
        discount: 0,
        isMarketplaceVisible: true,
        isSurpriseBag: true,
        originalPrice: data.originalPrice,
        pickupTimeStart: data.pickupTimeStart,
        pickupTimeEnd: data.pickupTimeEnd,
        surpriseBagContents: contents
      };

      await productService.createProduct(productData);
      
      toast({
        title: "Success!",
        description: "Your surprise bag has been created and is now available in the marketplace"
      });

      reset();
      setContents([]);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating surprise bag:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create surprise bag",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          Create Surprise Bag
        </CardTitle>
        <CardDescription>
          Create a Too Good To Go style surprise bag to reduce food waste and offer great deals to customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Surprise Bag Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Pastry Surprise"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what customers can expect in this surprise bag..."
                {...register("description", { required: "Description is required" })}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="originalPrice">Original Value</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  className="pl-10"
                  {...register("originalPrice", { 
                    required: "Original price is required",
                    min: { value: 0.01, message: "Price must be greater than 0" }
                  })}
                />
              </div>
              {errors.originalPrice && (
                <p className="text-sm text-red-600 mt-1">{errors.originalPrice.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Sale Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="8.99"
                  className="pl-10"
                  {...register("price", { 
                    required: "Sale price is required",
                    min: { value: 0.01, message: "Price must be greater than 0" }
                  })}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <div className="text-center">
                <Label>Discount</Label>
                <div className="text-2xl font-bold text-green-600">{discount}%</div>
                <p className="text-xs text-gray-500">savings</p>
              </div>
            </div>
          </div>

          {/* Pickup Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupTimeStart">Pickup Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="pickupTimeStart"
                  type="time"
                  className="pl-10"
                  {...register("pickupTimeStart", { required: "Start time is required" })}
                />
              </div>
              {errors.pickupTimeStart && (
                <p className="text-sm text-red-600 mt-1">{errors.pickupTimeStart.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="pickupTimeEnd">Pickup End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="pickupTimeEnd"
                  type="time"
                  className="pl-10"
                  {...register("pickupTimeEnd", { required: "End time is required" })}
                />
              </div>
              {errors.pickupTimeEnd && (
                <p className="text-sm text-red-600 mt-1">{errors.pickupTimeEnd.message}</p>
              )}
            </div>
          </div>

          {/* Quantity and Expiration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Number of Bags Available</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="5"
                {...register("quantity", { 
                  required: "Quantity is required",
                  min: { value: 1, message: "Must have at least 1 bag" }
                })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expirationDate">Available Until</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register("expirationDate", { required: "Expiration date is required" })}
              />
              {errors.expirationDate && (
                <p className="text-sm text-red-600 mt-1">{errors.expirationDate.message}</p>
              )}
            </div>
          </div>

          {/* Contents */}
          <div>
            <Label>Surprise Bag Contents</Label>
            <p className="text-sm text-gray-600 mb-2">
              Add items that might be included in this surprise bag
            </p>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g., Fresh croissants, muffins, Danish pastries..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContent())}
              />
              <Button type="button" onClick={addContent} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {contents.map((content, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {content}
                  <button
                    type="button"
                    onClick={() => removeContent(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Surprise Bag"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};