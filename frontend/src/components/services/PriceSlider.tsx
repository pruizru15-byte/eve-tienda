import React from 'react';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { DollarSign } from 'lucide-react';

interface PriceSliderProps {
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export const PriceSlider: React.FC<PriceSliderProps> = ({ max, value, onChange }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-xs bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/40 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Presupuesto Máx.
        </Label>
        <span className="text-xl font-bold text-primary tabular-nums">
          ${value.toLocaleString()}
        </span>
      </div>
      <Slider
        defaultValue={[value]}
        max={max}
        step={50}
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-background"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
        <span>$0</span>
        <span>${max.toLocaleString()}</span>
      </div>
    </div>
  );
};
