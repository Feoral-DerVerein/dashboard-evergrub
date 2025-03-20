
import { cn } from "@/lib/utils";

interface CategoryButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryButton = ({
  label,
  isActive = false,
  onClick
}: CategoryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors",
        isActive
          ? "bg-green-200 text-green-700 font-medium"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {label}
    </button>
  );
};

export default CategoryButton;
