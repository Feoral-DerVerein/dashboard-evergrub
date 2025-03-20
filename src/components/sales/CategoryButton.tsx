
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
        "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {label}
    </button>
  );
};

export default CategoryButton;
