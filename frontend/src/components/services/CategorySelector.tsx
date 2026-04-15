import React from 'react';
import { IServiceCategory } from '../../domain/models';
import { Badge } from '../ui/badge';

interface CategorySelectorProps {
  categories: IServiceCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        className={`cursor-pointer h-10 px-6 rounded-full text-sm font-medium transition-all ${
          selectedId === 'all'
            ? 'bg-primary text-primary-foreground shadow-lg scale-105'
            : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary border-transparent'
        }`}
        onClick={() => onSelect('all')}
      >
        Todos
      </Badge>
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          className={`cursor-pointer h-10 px-6 rounded-full text-sm font-medium transition-all ${
            selectedId === cat.id
              ? 'bg-primary text-primary-foreground shadow-lg scale-105 border-primary'
              : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
          }`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.title}
        </Badge>
      ))}
    </div>
  );
};
