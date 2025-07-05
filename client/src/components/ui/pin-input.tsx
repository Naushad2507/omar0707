import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PinInput({
  length = 4,
  value,
  onChange,
  onComplete,
  className,
  disabled = false,
  placeholder = ""
}: PinInputProps) {
  const [pins, setPins] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  useEffect(() => {
    // Update pins when value prop changes
    const newPins = value.split("").slice(0, length);
    while (newPins.length < length) {
      newPins.push("");
    }
    setPins(newPins);
  }, [value, length]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    if (newValue && !/^\d$/.test(newValue)) return;

    const newPins = [...pins];
    newPins[index] = newValue;
    setPins(newPins);

    const newPinValue = newPins.join("");
    onChange(newPinValue);

    // Auto-focus next input if current input has value
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all pins are filled
    if (newPinValue.length === length && onComplete) {
      onComplete(newPinValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, length);
        const newPins = Array(length).fill("");
        for (let i = 0; i < digits.length; i++) {
          newPins[i] = digits[i];
        }
        setPins(newPins);
        onChange(digits);
        
        if (digits.length === length && onComplete) {
          onComplete(digits);
        }
      });
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {pins.map((pin, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={pin}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-14 h-14 text-center text-xl font-bold min-h-[44px] min-w-[44px] touch-manipulation"
        />
      ))}
    </div>
  );
}