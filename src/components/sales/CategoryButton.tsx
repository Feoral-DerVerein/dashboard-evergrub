
import { cn } from "@/lib/utils";

interface CategoryButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryButton = ({ label, isActive = false, onClick }: CategoryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap",
        isActive
          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {label}
    </button>
  );
};

export default CategoryButton;
