import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  dealCount: number;
  color: string;
  onClick?: () => void;
}

export default function CategoryCard({ name, icon: Icon, dealCount, color, onClick }: CategoryCardProps) {
  const colorClasses = {
    saffron: "from-saffron/10 to-saffron/20 text-saffron",
    primary: "from-primary/10 to-primary/20 text-primary",
    success: "from-success/10 to-success/20 text-success",
    warning: "from-warning/10 to-warning/20 text-warning",
    royal: "from-royal/10 to-royal/20 text-royal",
    secondary: "from-secondary/10 to-secondary/20 text-secondary",
  };

  return (
    <div 
      className="text-center group cursor-pointer category-card"
      onClick={onClick}
    >
      <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl p-6 mb-3 group-hover:shadow-lg transition-all transform group-hover:-translate-y-1`}>
        <Icon className={`h-8 w-8 mx-auto ${color === 'saffron' ? 'text-saffron' : color === 'primary' ? 'text-primary' : color === 'success' ? 'text-success' : color === 'warning' ? 'text-warning' : color === 'royal' ? 'text-royal' : 'text-secondary'}`} />
      </div>
      <h3 className="font-semibold text-foreground">{name}</h3>
      <p className="text-sm text-gray-500">{dealCount}+ deals</p>
    </div>
  );
}
