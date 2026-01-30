import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 font-bold text-sm tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden";
  
  const variants = {
    primary: "bg-gray-100 text-black hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]",
    outline: "border border-gray-600 text-gray-300 hover:border-gray-100 hover:text-white hover:bg-white/5",
    ghost: "text-gray-500 hover:text-gray-300"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </span>
      {/* Glitch effect overlay on hover for primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-white/20 transition-transform duration-300" />
      )}
    </button>
  );
};