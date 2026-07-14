interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}

export function QuantityStepper({ value, min = 1, max = 99, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-full border border-plum/20 bg-white">
      <button
        type="button"
        className="h-9 w-9 rounded-full text-lg text-plum disabled:opacity-30"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="h-9 w-9 rounded-full text-lg text-plum disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
