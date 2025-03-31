
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Mock categories for demonstration
const categories = [
  { id: "1", name: "Food & Drinks", subcategories: ["Coffee", "Tea", "Pastries"] },
  { id: "2", name: "Home & Kitchen", subcategories: ["Tableware", "Appliances", "Decor"] },
  { id: "3", name: "Appliances", subcategories: ["Coffee Makers", "Grinders", "Water Heaters"] },
];

const CreateAd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    location: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "category") {
      setSelectedCategory(value);
      setFormData((prev) => ({ ...prev, subcategory: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
        continue;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        continue;
      }

      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      newFiles.push(file);
      newPreviews.push(previewUrl);
    }

    setImages((prev) => [...prev, ...newFiles]);
    setImagesPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagesPreviews[index]);
    
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    
    // In a real app, this would create the ad via an API call
    toast.success("Ad created successfully!");
    
    // Navigate back to the ads list
    setTimeout(() => navigate("/ads"), 1500);
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully!");
  };

  // Get subcategories based on selected category
  const getSubcategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(c => c.name === selectedCategory);
    return category?.subcategories || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white min-h-screen animate-fade-in pb-20">
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-200 flex items-center">
          <Link to="/ads" className="text-gray-600 mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Create New Ad</h1>
        </header>

        {/* Main Form */}
        <main className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Basic Information</h2>
              
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  Ad Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Concise, descriptive title for your ad"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of what you're offering"
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500">
                  You can use basic formatting like *bold* and _italic_
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    $
                  </span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="pl-6"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Category and Location */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Category & Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subcategory" className="block text-sm font-medium">
                    Subcategory
                  </label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("subcategory", value)}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategories().map((subcategory, index) => (
                        <SelectItem key={index} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium">
                  Location <span className="text-red-500">*</span>
                </label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State or Address"
                  required
                />
              </div>
            </div>
            
            {/* Images */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Images</h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Upload Photos <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Max 5 images, 5MB each (JPG, PNG)
                    </p>
                    <input
                      type="file"
                      id="images"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("images")?.click()}
                    >
                      Select Files
                    </Button>
                  </div>
                </div>
                
                {/* Image previews */}
                {imagesPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 md:grid-cols-4 gap-3">
                    {imagesPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-700 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Publish Ad
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreateAd;
