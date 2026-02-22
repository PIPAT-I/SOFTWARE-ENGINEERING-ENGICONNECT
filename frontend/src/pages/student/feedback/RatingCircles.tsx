interface RatingCirclesProps {
  value: number | null;
  onChange: (val: number) => void;
  name: string;
}

export function RatingCircles({ value, onChange, name }: RatingCirclesProps) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold text-sm transition-all ${
            value === num
              ? "bg-black text-white border-black scale-105"
              : "bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black"
          }`}
          aria-label={`${name} rating ${num}`}
        >
          {num}
        </button>
      ))}
    </div>
  );
}
