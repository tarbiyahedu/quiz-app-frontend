"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const filteredOptions = options.filter(
    (opt) =>
      !value.includes(opt.value) &&
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div>
      {label && <div className="mb-1 font-medium">{label}</div>}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((val) => {
          const opt = options.find((o) => o.value === val);
          return (
            <span
              key={val}
              className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs"
            >
              {opt?.label || val}
              <button
                type="button"
                className="ml-1"
                onClick={() => onChange(value.filter((v) => v !== val))}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>
      <input
        className={cn(
          "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400",
          "bg-background"
        )}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setInputValue("")}
        list="department-options"
      />
      <datalist id="department-options">
        {filteredOptions.map((opt) => (
          <option key={opt.value} value={opt.label} />
        ))}
      </datalist>
      {filteredOptions.length > 0 && (
        <div className="border rounded mt-1 bg-white shadow z-10 max-h-40 overflow-auto">
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              onClick={() => {
                onChange([...value, opt.value]);
                setInputValue("");
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 