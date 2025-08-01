// app/components/BadgeSymbol/BadgeSymbol.tsx
export interface BadgeSymbolProps {
  chemicalSymbol: string;
  atomicNumber?: number;
  variant?: 'card' | 'inline' | 'featured';  // Simplified variants
  className?: string; // Allow custom classes
}

export function BadgeSymbol({
  chemicalSymbol,
  atomicNumber,
  variant = 'card',
  className = ''
}: BadgeSymbolProps) {
  // Predefined styles based on common use cases
  const variantStyles = {
    card: 'absolute top-2 right-2 w-8 h-8 text-xs',
    inline: 'inline-flex w-6 h-6 text-xs mr-2',
    featured: 'w-16 h-16 text-base'
  };
  
  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded-md h-full">
        <div className="flex flex-col items-center">
          {atomicNumber && <span className="text-xs opacity-80">{atomicNumber}</span>}
          <span>{chemicalSymbol}</span>
        </div>
      </div>
    </div>
  );
}