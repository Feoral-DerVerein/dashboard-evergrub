interface NegentropyMenuProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const NegentropyMenu = ({ onSuggestionClick }: NegentropyMenuProps) => {
  return (
    <div className="flex justify-center items-center min-h-[80px]">
      <img 
        src="/lovable-uploads/jni-logo.png" 
        alt="JNI Logo" 
        className="h-16 w-auto object-contain"
      />
    </div>
  );
};
