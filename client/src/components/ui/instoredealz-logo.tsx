interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "full" | "text-only";
}

export default function InstoredeelzLogo({ 
  className = "", 
  size = "md",
  variant = "full" 
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8", 
    lg: "h-12",
    xl: "h-16"
  };

  const LogoIcon = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`} fill="currentColor">
      {/* Discount tag icon based on the logo */}
      <path d="M15 25 L70 25 L85 40 L85 75 L80 80 L75 75 L75 45 L25 45 L25 75 L20 80 L15 75 Z" 
            fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
      {/* Percentage symbols */}
      <circle cx="35" cy="35" r="3" fill="currentColor"/>
      <circle cx="55" cy="35" r="3" fill="currentColor"/>
      <line x1="45" y1="25" x2="45" y2="45" stroke="currentColor" strokeWidth="2"/>
      {/* Tag string/hole */}
      <circle cx="75" cy="30" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const LogoText = () => (
    <span className={`font-bold tracking-wide ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-lg'}`}>
      instoredealz
    </span>
  );

  if (variant === "icon") {
    return <LogoIcon />;
  }

  if (variant === "text-only") {
    return <LogoText />;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  );
}