import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder="Buscar servicios (ej. Web, SEO, IA...)"
        className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-2 focus-visible:ring-primary/30 transition-all text-lg rounded-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
