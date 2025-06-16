import logoImage from "../../assets/Instoredealz logo_1749978877977.jpg";

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
    <img 
      src={logoImage} 
      alt="Instoredealz" 
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
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