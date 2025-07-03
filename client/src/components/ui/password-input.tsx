import { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthIndicator = false, showRequirements = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState<PasswordStrength>({
      score: 0,
      label: "",
      color: "",
      requirements: {
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
      },
    });

    const calculatePasswordStrength = (password: string): PasswordStrength => {
      const requirements = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };

      const score = Object.values(requirements).filter(Boolean).length;
      
      let label = "";
      let color = "";

      if (password.length === 0) {
        label = "";
        color = "";
      } else if (score <= 2) {
        label = "Weak";
        color = "text-red-500";
      } else if (score <= 3) {
        label = "Fair";
        color = "text-yellow-500";
      } else if (score <= 4) {
        label = "Good";
        color = "text-blue-500";
      } else {
        label = "Strong";
        color = "text-green-500";
      }

      return { score, label, color, requirements };
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const password = e.target.value;
      if (showStrengthIndicator || showRequirements) {
        setStrength(calculatePasswordStrength(password));
      }
      props.onChange?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          
          <Input
            {...props}
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn("pl-10 pr-12", className)}
            onChange={handlePasswordChange}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator && props.value && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Password strength:</span>
              <span className={cn("text-sm font-medium", strength.color)}>
                {strength.label}
              </span>
            </div>
            
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    i <= strength.score
                      ? strength.score <= 2
                        ? "bg-red-500"
                        : strength.score <= 3
                        ? "bg-yellow-500"
                        : strength.score <= 4
                        ? "bg-blue-500"
                        : "bg-green-500"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Password Requirements */}
        {showRequirements && props.value && (
          <div className="space-y-1">
            <p className="text-sm text-gray-600 font-medium">Password must contain:</p>
            <div className="space-y-1">
              {Object.entries({
                length: "At least 8 characters",
                lowercase: "One lowercase letter",
                uppercase: "One uppercase letter", 
                number: "One number",
                special: "One special character (!@#$%^&*)",
              }).map(([key, text]) => (
                <div key={key} className="flex items-center space-x-2">
                  {strength.requirements[key as keyof typeof strength.requirements] ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      strength.requirements[key as keyof typeof strength.requirements]
                        ? "text-green-600"
                        : "text-gray-500"
                    )}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };