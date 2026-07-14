export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-brass text-sm" aria-label={`Rated ${rating} out of 5`}>
      {"★".repeat(full)}
      <span className="text-brass/30">{"★".repeat(5 - full)}</span>
    </span>
  );
}
